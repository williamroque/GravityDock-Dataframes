import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class PackColumnsNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'packColumns';
    readonly displayName = 'Pack Columns';
    readonly visible = true;
    readonly inputs = [
        { name: 'Col 1', acceptsType: 'core:array' },
        { name: 'Col 2', acceptsType: 'core:array' },
        { name: 'Col 3', acceptsType: 'core:array' },
        { name: 'Col 4', acceptsType: 'core:array' },
        { name: 'Col 5', acceptsType: 'core:array' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'columnNames',
            label: 'Column Names (comma separated)',
            type: 'text' as const,
            defaultValue: 'col1,col2,col3,col4,col5'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const colNamesStr = properties.columnNames as string || '';
        const colNames = colNamesStr.split(',').map(c => c.trim()).filter(c => c);
        
        const dataObj: Record<string, any[]> = {};
        
        for (let i = 0; i < 5; i++) {
            const inputKey = `Col ${i + 1}`;
            const arr = inputs[inputKey];
            if (Array.isArray(arr) && i < colNames.length) {
                dataObj[colNames[i]] = arr;
            }
        }

        if (Object.keys(dataObj).length === 0) return {};

        try {
            const table = aq.from(dataObj);
            return { Data: table };
        } catch (err) {
            console.error('Failed to pack columns:', err);
            return {};
        }
    }
}
