import { ExecuteNode } from '@gravitydock/types';
import * as aq from 'arquero';
import { extractTable } from '../utils';

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
        const rawData = inputs['Data'];
        const filePath = properties.filePath as string;
        
        if (!rawData || !filePath) return {};

        try {
            const table = extractTable(rawData);
            const format = (properties.format as string) || 'row';
            let jsonStr = '';
            
            if (format === 'row') {
                let jsonData: any[] = [];
                if (table && typeof table.objects === 'function') {
                    jsonData = table.objects();
                } else if (Array.isArray(rawData)) {
                    jsonData = rawData;
                } else if (rawData && Array.isArray(rawData.__arqueroData)) {
                    jsonData = rawData.__arqueroData;
                } else if (rawData && Array.isArray(rawData.rows)) {
                    jsonData = rawData.rows;
                }
                jsonStr = JSON.stringify(jsonData, null, 2);
            } else {
                if (table && typeof table.columnNames === 'function') {
                    const colObj: any = {};
                    for (const colName of table.columnNames()) {
                        colObj[colName] = Array.from(table.array(colName));
                    }
                    jsonStr = JSON.stringify(colObj, null, 2);
                } else if (Array.isArray(rawData)) {
                    jsonStr = JSON.stringify(rawData, null, 2);
                }
            }
            
            await gravityDock.fs.writeFile(filePath, jsonStr);
            return {};
        } catch (err) {
            console.error('Failed to write JSON:', err);
            return {};
        }
    }
}
