import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';
import { convertToTargetUnit, parseQuantity } from '../units';
import { buildTableFromRows } from '../utils';

type ParsedCell =
    | { kind: 'numeric'; value: number; unit: string }
    | { kind: 'exact'; value: unknown };

function parseCell(raw: unknown, targetUnit: string, defaultUnit: string): ParsedCell {
    const q = parseQuantity(raw, defaultUnit);
    if (!q) {
        return { kind: 'exact', value: raw };
    }

    if (targetUnit) {
        const converted = convertToTargetUnit(q.value, q.unit || targetUnit, targetUnit);
        if (converted === null) {
            return { kind: 'exact', value: raw };
        }
        return { kind: 'numeric', value: converted, unit: targetUnit };
    }

    return { kind: 'numeric', value: q.value, unit: q.unit };
}

function cellsMatch(a: ParsedCell, b: ParsedCell, tolerance: number): boolean {
    if (a.kind === 'numeric' && b.kind === 'numeric') {
        if (a.unit === b.unit) {
            return Math.abs(a.value - b.value) <= tolerance;
        }
        const convertedB = convertToTargetUnit(b.value, b.unit, a.unit);
        if (convertedB === null) return false;
        return Math.abs(a.value - convertedB) <= tolerance;
    }

    if (a.kind === 'exact' && b.kind === 'exact') {
        if (Number.isNaN(a.value) && Number.isNaN(b.value)) return true;
        return a.value === b.value;
    }

    return false;
}

function rowsMatch(a: ParsedCell[], b: ParsedCell[], tolerance: number): boolean {
    for (let k = 0; k < a.length; k++) {
        if (!cellsMatch(a[k], b[k], tolerance)) return false;
    }
    return true;
}

export class DeduplicateToleranceNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'deduplicateTolerance';
    readonly displayName = 'Deduplicate (Tolerance)';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' },
        { name: 'Tolerance', acceptsType: ['core:number', 'core:quantity', 'core:string'] }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'columns',
            label: 'Subset columns (empty for all)',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'tolerance',
            label: 'Tolerance',
            type: 'number' as const,
            defaultValue: 0.001,
            min: 0
        },
        {
            name: 'toleranceUnit',
            label: 'Tolerance Unit (optional)',
            description: 'Optional unit for tolerance (e.g. m, km, cm, mm, in, ft, deg, rad, s, ms, kg, g)',
            type: 'string' as const,
            defaultValue: ''
        },
        {
            name: 'defaultUnit',
            label: 'Default Column Unit (optional)',
            description: 'Unit assumed for plain numbers without units (defaults to Tolerance Unit)',
            type: 'string' as const,
            defaultValue: ''
        },
        {
            name: 'keep',
            label: 'Keep',
            type: 'select' as const,
            options: [
                { label: 'First', value: 'first' },
                { label: 'Last', value: 'last' }
            ],
            defaultValue: 'first'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};

        const columnNames = table.columnNames();
        const colsStr = (properties.columns as string) || '';
        const requestedCols = colsStr.split(',').map(c => c.trim()).filter(Boolean);
        const targetCols = requestedCols.length > 0 ? requestedCols : columnNames;

        if (targetCols.length === 0) return { Data: table };

        for (const col of targetCols) {
            if (!columnNames.includes(col)) {
                console.error(`Deduplicate (Tolerance): missing column ${col}`);
                return {};
            }
        }

        let tolerance = Math.max(0, Number(properties.tolerance ?? 0));
        let toleranceUnit = ((properties.toleranceUnit as string) || '').trim();

        if (inputs['Tolerance'] !== undefined && inputs['Tolerance'] !== null) {
            const parsedTol = parseQuantity(inputs['Tolerance']);
            if (!parsedTol) {
                console.error('Deduplicate (Tolerance): invalid Tolerance input');
                return {};
            }
            tolerance = Math.max(0, parsedTol.value);
            if (parsedTol.unit) {
                toleranceUnit = parsedTol.unit;
            }
        }

        if (!Number.isFinite(tolerance)) {
            console.error('Deduplicate (Tolerance): invalid tolerance');
            return {};
        }

        const defaultUnit = ((properties.defaultUnit as string) || '').trim() || toleranceUnit;
        const keep = (properties.keep as string) || 'first';

        try {
            const rows = table.objects() as Record<string, any>[];
            const parsedRows = rows.map(row =>
                targetCols.map(col => parseCell(row[col], toleranceUnit, defaultUnit))
            );

            const keepFlags = new Array<boolean>(rows.length).fill(false);
            const binSize = tolerance > 0 ? tolerance : 1e-9;
            const numericBuckets = new Map<number, ParsedCell[][]>();
            const exactBuckets = new Map<string, ParsedCell[][]>();
            const unbucketed: ParsedCell[][] = [];

            const start = keep === 'last' ? rows.length - 1 : 0;
            const end = keep === 'last' ? -1 : rows.length;
            const step = keep === 'last' ? -1 : 1;

            for (let i = start; i !== end; i += step) {
                const parsed = parsedRows[i];
                const primary = parsed[0];
                let isDuplicate = false;

                if (primary.kind === 'numeric' && (toleranceUnit !== '' || primary.unit === defaultUnit)) {
                    const bin = Math.floor(primary.value / binSize);
                    for (let b = bin - 1; b <= bin + 1 && !isDuplicate; b++) {
                        const candidates = numericBuckets.get(b);
                        if (!candidates) continue;
                        for (const cand of candidates) {
                            if (rowsMatch(parsed, cand, tolerance)) {
                                isDuplicate = true;
                                break;
                            }
                        }
                    }

                    if (!isDuplicate) {
                        keepFlags[i] = true;
                        const list = numericBuckets.get(bin);
                        if (list) list.push(parsed);
                        else numericBuckets.set(bin, [parsed]);
                    }
                } else if (primary.kind === 'exact') {
                    const key = String(primary.value);
                    const candidates = exactBuckets.get(key);
                    if (candidates) {
                        for (const cand of candidates) {
                            if (rowsMatch(parsed, cand, tolerance)) {
                                isDuplicate = true;
                                break;
                            }
                        }
                    }

                    if (!isDuplicate) {
                        keepFlags[i] = true;
                        if (candidates) candidates.push(parsed);
                        else exactBuckets.set(key, [parsed]);
                    }
                } else {
                    for (const cand of unbucketed) {
                        if (rowsMatch(parsed, cand, tolerance)) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    if (!isDuplicate) {
                        keepFlags[i] = true;
                        unbucketed.push(parsed);
                    }
                }
            }

            const keptRows = rows.filter((_, idx) => keepFlags[idx]);
            return { Data: buildTableFromRows(keptRows, columnNames) };
        } catch (err) {
            console.error('Failed to deduplicate (tolerance):', err);
            return {};
        }
    }
}
