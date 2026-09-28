import { BaseNode } from '@tracereactive/types';
import * as aq from 'arquero';

export class MutateColumnNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'mutateColumn';
    readonly displayName = 'Mutate Column';
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
            label: 'Target Column Name',
            type: 'text' as const,
            defaultValue: 'new_column'
        },
        {
            name: 'expression',
            label: 'Expression (e.g. d.A + d.B)',
            type: 'js-expression' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colName = properties.columnName as string || 'new_column';
        const expr = properties.expression as string;
        
        if (!expr || expr.trim() === '') return { Data: table };

        try {
            const mutateFn = new Function('d', 'aq', 'op', `return ${expr}`);
            const newTable = table.derive({
                [colName]: aq.escape((d: any) => mutateFn(d, aq, aq.op))
            });
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to mutate column:', err);
            return {};
        }
    }
}
