import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class DropColumnsNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'dropColumns';
    readonly displayName = 'Drop Columns';
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
            label: 'Columns to drop (comma separated)',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colsStr = properties.columns as string || '';
        const cols = colsStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (cols.length === 0) return { Data: table };

        try {
            // aq.not() drops columns
            const newTable = table.select(aq.not(...cols));
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to drop columns:', err);
            return {};
        }
    }
}
