import { BaseNode } from '@tracereactive/types';
import * as aq from 'arquero';

export class FilterRowsNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'filterRows';
    readonly displayName = 'Filter Rows';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'expression',
            label: 'Filter Expression (e.g. d.age > 20)',
            type: 'js-expression' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const expr = properties.expression as string;
        if (!expr || expr.trim() === '') return { Data: table };

        try {
            // Using Arquero's escape to parse string expressions.
            // aq.escape allows passing an arbitrary string containing an expression.
            // In Arquero, filter accepts an arrow function or an arquero expression.
            // Since we receive a string, the safest way is to use new Function, 
            // but Arquero natively supports parsing some expressions if we build them, or we can use aq.escape.
            // For true string eval in arquero:
            const filterFn = new Function('d', 'aq', 'op', `return ${expr}`);
            const newTable = table.filter(aq.escape((d: any) => filterFn(d, aq, aq.op)));
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to filter rows:', err);
            return {};
        }
    }
}
