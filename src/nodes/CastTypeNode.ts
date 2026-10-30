import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class CastTypeNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'castType';
    readonly displayName = 'Cast Type';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'columnName',
            label: 'Column Name',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'targetType',
            label: 'Target Type',
            type: 'select' as const,
            options: [
                { label: 'String', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'Date', value: 'date' }
            ],
            defaultValue: 'string'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colName = properties.columnName as string;
        const targetType = properties.targetType as string;
        
        if (!colName || !targetType) return { Data: table };

        try {
            let castFnStr = '';
            if (targetType === 'string') castFnStr = 'String(d[colName])';
            else if (targetType === 'number') castFnStr = 'Number(d[colName])';
            else if (targetType === 'boolean') castFnStr = 'Boolean(d[colName])';
            else if (targetType === 'date') castFnStr = 'new Date(d[colName])';
            
            const castFn = new Function('d', 'colName', `return ${castFnStr}`);
            
            const newTable = table.derive({
                [colName]: aq.escape((d: any) => castFn(d, colName))
            });
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to cast column type:', err);
            return {};
        }
    }
}
