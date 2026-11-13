import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';
import { buildTableFromRows } from '../utils';

export class DeduplicateExactNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'deduplicateExact';
    readonly displayName = 'Deduplicate (Exact)';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
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

        const colsStr = (properties.columns as string) || '';
        const cols = colsStr.split(',').map(c => c.trim()).filter(Boolean);
        const keep = (properties.keep as string) || 'first';

        try {
            if (keep !== 'last') {
                const newTable = cols.length > 0 ? table.dedupe(...cols) : table.dedupe();
                return { Data: newTable };
            }

            const columnNames = table.columnNames();
            const keyCols = cols.length > 0 ? cols : columnNames;
            const rows = table.objects() as Record<string, any>[];
            const seen = new Set<string>();
            const keepFlags = new Array<boolean>(rows.length).fill(false);

            for (let i = rows.length - 1; i >= 0; i--) {
                const row = rows[i];
                const key = JSON.stringify(keyCols.map(c => row[c]));
                if (!seen.has(key)) {
                    seen.add(key);
                    keepFlags[i] = true;
                }
            }

            const keptRows = rows.filter((_, idx) => keepFlags[idx]);
            return { Data: buildTableFromRows(keptRows, columnNames) };
        } catch (err) {
            console.error('Failed to deduplicate (exact):', err);
            return {};
        }
    }
}
