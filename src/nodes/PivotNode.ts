import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class PivotNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'pivot';
    readonly displayName = 'Pivot (Wide to Long)';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'keys',
            label: 'ID Columns (comma separated)',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'asNames',
            label: 'New names (key_col, value_col)',
            type: 'text' as const,
            defaultValue: 'key,value'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const keysStr = properties.keys as string || '';
        const keys = keysStr.split(',').map(c => c.trim()).filter(c => c);
        
        const asNamesStr = properties.asNames as string || 'key,value';
        const asNames = asNamesStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (keys.length === 0) return { Data: table };

        try {
            // Fold in Arquero is like melt in pandas (Wide to Long)
            const newTable = table.fold(aq.not(...keys), { as: [asNames[0] || 'key', asNames[1] || 'value'] });
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to pivot dataframe:', err);
            return {};
        }
    }
}
