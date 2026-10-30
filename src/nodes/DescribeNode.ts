import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class DescribeNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'describe';
    readonly displayName = 'Describe (Summary)';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};

        try {
            const numericCols = table.columnNames().filter(c => {
                const type = typeof table.get(c, 0);
                return type === 'number';
            });

            if (numericCols.length === 0) return { Data: table };

            const rollupObj: any = {};
            for (const col of numericCols) {
                rollupObj[`${col}_count`] = aq.escape((d: any) => aq.op.count(d[col]));
                rollupObj[`${col}_mean`] = aq.escape((d: any) => aq.op.mean(d[col]));
                rollupObj[`${col}_std`] = aq.escape((d: any) => aq.op.stdev(d[col]));
                rollupObj[`${col}_min`] = aq.escape((d: any) => aq.op.min(d[col]));
                rollupObj[`${col}_max`] = aq.escape((d: any) => aq.op.max(d[col]));
            }

            const statsTable = table.rollup(rollupObj);
            
            // To mimic pandas describe(), we need to fold this wide table into a long one
            // We'll skip the folding for now and just return the wide 1-row table with stats.
            
            return { Data: statsTable };
        } catch (err) {
            console.error('Failed to describe dataframe:', err);
            return {};
        }
    }
}
