import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class MergeNode extends BaseNode {
    readonly category = { name: 'Analytics', accent: 'purple-500' } as any;
    readonly typeId = 'merge';
    readonly displayName = 'Merge (Join)';
    readonly visible = true;
    readonly inputs = [
        { name: 'Left Data', acceptsType: 'core:dataframe' },
        { name: 'Right Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'joinType',
            label: 'Join Type',
            type: 'select' as const,
            options: [
                { label: 'Inner', value: 'inner' },
                { label: 'Left', value: 'left' },
                { label: 'Right', value: 'right' },
                { label: 'Outer', value: 'outer' },
                { label: 'Anti', value: 'anti' },
                { label: 'Semi', value: 'semi' }
            ],
            defaultValue: 'inner'
        },
        {
            name: 'keys',
            label: 'Join Keys (comma separated)',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const leftTable = inputs['Left Data'] as aq.internal.Table | undefined;
        const rightTable = inputs['Right Data'] as aq.internal.Table | undefined;
        
        if (!leftTable) return {};
        if (!rightTable) return { Data: leftTable };
        
        const joinType = properties.joinType as string || 'inner';
        const keysStr = properties.keys as string || '';
        const keys = keysStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (keys.length === 0) return { Data: leftTable };

        try {
            let newTable: aq.internal.Table;
            
            // In Arquero, join types are specific methods
            if (joinType === 'inner') {
                newTable = leftTable.join(rightTable, keys);
            } else if (joinType === 'left') {
                newTable = leftTable.join_left(rightTable, keys);
            } else if (joinType === 'right') {
                newTable = leftTable.join_right(rightTable, keys);
            } else if (joinType === 'outer') {
                newTable = leftTable.join_full(rightTable, keys);
            } else if (joinType === 'anti') {
                newTable = leftTable.antijoin(rightTable, keys);
            } else if (joinType === 'semi') {
                newTable = leftTable.semijoin(rightTable, keys);
            } else {
                newTable = leftTable.join(rightTable, keys);
            }
            
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to merge dataframes:', err);
            return {};
        }
    }
}
