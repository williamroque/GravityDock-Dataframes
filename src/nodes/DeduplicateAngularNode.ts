import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';
import { angularSeparationRad, angularToleranceToRadians, parseAngleToRadians, parseQuantity } from '../units';
import { buildTableFromRows } from '../utils';

interface KeptPoint {
    lon: number;
    lat: number;
}

export class DeduplicateAngularNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'deduplicateAngular';
    readonly displayName = 'Deduplicate (Angular)';
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
            name: 'coordSystem',
            label: 'Coordinate System',
            type: 'select' as const,
            options: [
                { label: 'Lat / Long', value: 'latlon' },
                { label: 'RA / Dec', value: 'radec' }
            ],
            defaultValue: 'latlon'
        },
        {
            name: 'lonColumn',
            label: 'Longitude / RA Column',
            type: 'string' as const,
            defaultValue: 'lon'
        },
        {
            name: 'latColumn',
            label: 'Latitude / Dec Column',
            type: 'string' as const,
            defaultValue: 'lat'
        },
        {
            name: 'coordUnit',
            label: 'Coordinate Unit',
            type: 'select' as const,
            options: [
                { label: 'Degrees', value: 'deg' },
                { label: 'Radians', value: 'rad' },
                { label: 'RA Hours / Dec Degrees', value: 'hours_deg' }
            ],
            defaultValue: 'deg'
        },
        {
            name: 'tolerance',
            label: 'Angular Tolerance',
            type: 'number' as const,
            defaultValue: 1,
            min: 0
        },
        {
            name: 'toleranceUnit',
            label: 'Tolerance Unit',
            type: 'select' as const,
            options: [
                { label: 'Degrees (°)', value: 'deg' },
                { label: 'Arcminutes (\')', value: 'arcmin' },
                { label: 'Arcseconds (")', value: 'arcsec' },
                { label: 'Milliarcseconds (mas)', value: 'mas' },
                { label: 'Radians (rad)', value: 'rad' }
            ],
            defaultValue: 'arcsec'
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

        const lonColumn = ((properties.lonColumn as string) || '').trim();
        const latColumn = ((properties.latColumn as string) || '').trim();
        if (!lonColumn || !latColumn) return { Data: table };

        const columnNames = table.columnNames();
        if (!columnNames.includes(lonColumn) || !columnNames.includes(latColumn)) {
            console.error(`Deduplicate (Angular): missing column(s) ${lonColumn}, ${latColumn}`);
            return {};
        }

        const coordUnit = ((properties.coordUnit as string) || 'deg') as 'deg' | 'rad' | 'hours_deg';
        let tolerance = Math.max(0, Number(properties.tolerance ?? 0));
        let toleranceUnit = (properties.toleranceUnit as string) || 'arcsec';

        if (inputs['Tolerance'] !== undefined && inputs['Tolerance'] !== null) {
            const parsedTol = parseQuantity(inputs['Tolerance']);
            if (!parsedTol) {
                console.error('Deduplicate (Angular): invalid Tolerance input');
                return {};
            }
            tolerance = Math.max(0, parsedTol.value);
            if (parsedTol.unit) {
                toleranceUnit = parsedTol.unit;
            }
        }

        const keep = (properties.keep as string) || 'first';

        if (!Number.isFinite(tolerance)) {
            console.error('Deduplicate (Angular): invalid tolerance');
            return {};
        }

        const tolRad = angularToleranceToRadians(tolerance, toleranceUnit);
        const binSize = tolRad > 0 ? tolRad : 1e-9;

        try {
            const rows = table.objects() as Record<string, any>[];
            const keepFlags = new Array<boolean>(rows.length).fill(false);
            const buckets = new Map<number, KeptPoint[]>();

            const start = keep === 'last' ? rows.length - 1 : 0;
            const end = keep === 'last' ? -1 : rows.length;
            const step = keep === 'last' ? -1 : 1;

            for (let i = start; i !== end; i += step) {
                const row = rows[i];
                const lonRad = parseAngleToRadians(row[lonColumn], coordUnit, true);
                const latRad = parseAngleToRadians(row[latColumn], coordUnit, false);

                if (lonRad === null || latRad === null) {
                    keepFlags[i] = true;
                    continue;
                }

                const bin = Math.floor(latRad / binSize);
                let isDuplicate = false;

                for (let b = bin - 1; b <= bin + 1 && !isDuplicate; b++) {
                    const candidates = buckets.get(b);
                    if (!candidates) continue;
                    for (const pt of candidates) {
                        if (Math.abs(latRad - pt.lat) > tolRad) continue;
                        if (angularSeparationRad(lonRad, latRad, pt.lon, pt.lat) <= tolRad) {
                            isDuplicate = true;
                            break;
                        }
                    }
                }

                if (!isDuplicate) {
                    keepFlags[i] = true;
                    const list = buckets.get(bin);
                    if (list) {
                        list.push({ lon: lonRad, lat: latRad });
                    } else {
                        buckets.set(bin, [{ lon: lonRad, lat: latRad }]);
                    }
                }
            }

            const keptRows = rows.filter((_, idx) => keepFlags[idx]);
            return { Data: buildTableFromRows(keptRows, columnNames) };
        } catch (err) {
            console.error('Failed to deduplicate (angular):', err);
            return {};
        }
    }
}
