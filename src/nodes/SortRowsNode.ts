import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class SortRowsNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'sortRows';
    readonly displayName = 'Sort Rows';
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
            label: 'Columns to sort by (comma separated)',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'order',
            label: 'Order',
            type: 'select' as const,
            options: [
                { label: 'Ascending', value: 'asc' },
                { label: 'Descending', value: 'desc' }
            ],
            defaultValue: 'asc'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colsStr = properties.columns as string || '';
        const cols = colsStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (cols.length === 0) return { Data: table };

        try {
            const order = properties.order === 'desc' ? aq.desc : (c: string) => c;
            const sortCols = cols.map(c => properties.order === 'desc' ? aq.desc(c) : c);
            const newTable = table.orderby(...sortCols);
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to sort rows:', err);
            return {};
        }
    }
}
