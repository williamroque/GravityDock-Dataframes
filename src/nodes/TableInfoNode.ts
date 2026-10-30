import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class TableInfoNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'tableInfo';
    readonly displayName = 'Table Info';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Row Count', outputType: 'number' },
        { name: 'Column Count', outputType: 'number' },
        { name: 'Columns', outputType: 'array' }
    ];
    readonly properties = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        return {
            'Row Count': table.numRows(),
            'Column Count': table.numCols(),
            'Columns': table.columnNames()
        };
    }
}
