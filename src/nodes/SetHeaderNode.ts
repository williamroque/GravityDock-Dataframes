import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class SetHeaderNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'setHeader';
    readonly displayName = 'Set Header Row';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'rowIndex',
            label: 'Row Index (0-based)',
            type: 'number' as const,
            defaultValue: 0
        },
        {
            name: 'dropEmpty',
            label: 'Drop Columns with Empty Headers',
            type: 'boolean' as const,
            defaultValue: true
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const rowIndex = properties.rowIndex !== undefined ? Number(properties.rowIndex) : 0;
        
        try {
            if (rowIndex < 0 || rowIndex >= table.numRows()) {
                 return { Data: table };
            }

            const rowObjects = table.objects();
            const rowData = rowObjects[rowIndex];
            
            const renameMap: Record<string, string> = {};
            const colsToDrop: string[] = [];

            table.columnNames().forEach(oldName => {
                const newName = rowData[oldName];
                if (newName === undefined || newName === null || String(newName).trim() === '') {
                    if (properties.dropEmpty) {
                        colsToDrop.push(oldName);
                    } else {
                        renameMap[oldName] = `Unnamed_${oldName}`;
                    }
                } else {
                    renameMap[oldName] = String(newName).trim();
                }
            });
            
            let newTable = table;
            if (colsToDrop.length > 0) {
                newTable = newTable.select(aq.not(...colsToDrop));
            }
            
            const finalRenameMap: Record<string, string> = {};
            const usedNames = new Set<string>();
            
            newTable.columnNames().forEach(oldName => {
                const newName = renameMap[oldName] || oldName;
                
                let uniqueName = newName;
                let counter = 1;
                while (usedNames.has(uniqueName)) {
                    uniqueName = `${newName}_${counter}`;
                    counter++;
                }
                usedNames.add(uniqueName);
                finalRenameMap[oldName] = uniqueName;
            });

            newTable = newTable.rename(finalRenameMap);
            newTable = newTable.slice(rowIndex + 1);

            return { Data: newTable };
        } catch (err) {
            console.error('Failed to set header:', err);
            return {};
        }
    }
}
