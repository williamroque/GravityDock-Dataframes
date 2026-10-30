import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class RenameColumnsNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'renameColumns';
    readonly displayName = 'Rename Columns';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'renames',
            label: 'Rename map (old:new, old2:new2)',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const renamesStr = properties.renames as string || '';
        const pairs = renamesStr.split(',').map(c => c.trim()).filter(c => c);
        
        if (pairs.length === 0) return { Data: table };

        try {
            const renameMap: Record<string, string> = {};
            for (const pair of pairs) {
                const parts = pair.split(':').map(p => p.trim());
                if (parts.length === 2) {
                    renameMap[parts[0]] = parts[1]; // Arquero uses rename({ oldName: 'newName' })
                }
            }
            
            if (Object.keys(renameMap).length > 0) {
                const newTable = table.rename(renameMap);
                return { Data: newTable };
            }
            return { Data: table };
        } catch (err) {
            console.error('Failed to rename columns:', err);
            return {};
        }
    }
}
