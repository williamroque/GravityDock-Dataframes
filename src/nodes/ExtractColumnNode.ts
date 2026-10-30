import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class ExtractColumnNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'extractColumn';
    readonly displayName = 'Extract Column';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Array', outputType: 'core:array' }
    ];
    readonly properties = [
        {
            name: 'columnName',
            label: 'Column Name',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colName = properties.columnName as string;
        if (!colName) return {};

        try {
            const arr = table.array(colName);
            // Array from Arquero might be TypedArray or standard Array, convert to standard
            return { Array: Array.from(arr) };
        } catch (err) {
            console.error('Failed to extract column:', err);
            return {};
        }
    }
}
