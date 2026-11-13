import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class DropDuplicatesNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'dropDuplicates';
    readonly displayName = 'Drop Duplicates';
    readonly visible = false;
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
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colsStr = properties.columns as string || '';
        const cols = colsStr.split(',').map(c => c.trim()).filter(c => c);

        try {
            // aq.dedupe takes column names to check for duplicates
            const newTable = cols.length > 0 ? table.dedupe(...cols) : table.dedupe();
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to drop duplicates:', err);
            return {};
        }
    }
}
