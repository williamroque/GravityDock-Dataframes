import { ExecuteNode } from '@gravitydock/types';
import * as aq from 'arquero';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class WriteJSONNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'writeJson';
    readonly displayName = 'Write JSON';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [];
    readonly properties = [
        {
            name: 'filePath',
            label: 'Output File Path',
            type: 'filepath' as const,
            defaultValue: ''
        },
        {
            name: 'format',
            label: 'JSON Format',
            type: 'select' as const,
            options: [
                { label: 'Array of Objects', value: 'row' },
                { label: 'Column Arrays', value: 'column' }
            ],
            defaultValue: 'row'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        const filePath = properties.filePath as string;
        
        if (!table || !filePath) return {};

        try {
            const format = properties.format as string || 'row';
            let jsonStr = '';
            
            if (format === 'row') {
                jsonStr = JSON.stringify(table.objects(), null, 2);
            } else {
                const colObj: any = {};
                for (const colName of table.columnNames()) {
                    colObj[colName] = Array.from(table.array(colName));
                }
                jsonStr = JSON.stringify(colObj, null, 2);
            }
            
            await gravityDock.fs.writeFile(filePath, jsonStr);
            return {};
        } catch (err) {
            console.error('Failed to write JSON:', err);
            return {};
        }
    }
}
