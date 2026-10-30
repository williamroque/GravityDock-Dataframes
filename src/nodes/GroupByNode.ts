import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class GroupByNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'groupBy';
    readonly displayName = 'Group By & Aggregate';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'groupByColumns',
            label: 'Group By Columns (comma separated)',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'aggregations',
            label: 'Aggregations (e.g. sum_a: op.sum("a"))',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const groupByStr = properties.groupByColumns as string || '';
        const groupCols = groupByStr.split(',').map(c => c.trim()).filter(c => c);
        
        const aggStr = properties.aggregations as string || '';
        if (groupCols.length === 0 || !aggStr) return { Data: table };

        try {
            // Parse aggregations. Expected format: 'sum_sales: op.sum("sales"), avg_price: op.mean("price")'
            // We can wrap it in an object and evaluate
            const aggPairs = aggStr.split(',').map(c => c.trim()).filter(c => c);
            const rollupObj: any = {};
            
            for (const pair of aggPairs) {
                const parts = pair.split(':').map(p => p.trim());
                if (parts.length === 2) {
                    const outName = parts[0];
                    const expr = parts[1];
                    const fn = new Function('aq', 'op', `return ${expr}`);
                    rollupObj[outName] = fn(aq, aq.op);
                }
            }

            const newTable = table.groupby(...groupCols).rollup(rollupObj);
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to group and aggregate:', err);
            return {};
        }
    }
}
