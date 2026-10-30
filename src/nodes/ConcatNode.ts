import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class ConcatNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'concat';
    readonly displayName = 'Concat';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data 1', acceptsType: 'core:dataframe' },
        { name: 'Data 2', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'axis',
            label: 'Axis',
            type: 'select' as const,
            options: [
                { label: 'Rows (Vertical)', value: 'rows' },
                { label: 'Columns (Horizontal)', value: 'cols' }
            ],
            defaultValue: 'rows'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table1 = inputs['Data 1'] as aq.internal.Table | undefined;
        const table2 = inputs['Data 2'] as aq.internal.Table | undefined;
        
        if (!table1 && !table2) return {};
        if (!table1) return { Data: table2 };
        if (!table2) return { Data: table1 };

        const axis = properties.axis as string || 'rows';

        try {
            let newTable: aq.internal.Table;
            if (axis === 'rows') {
                newTable = table1.concat(table2);
            } else {
                newTable = table1.assign(table2);
            }
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to concat dataframes:', err);
            return {};
        }
    }
}
