import { ExecuteNode } from '@gravitydock/types';
import * as aq from 'arquero';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class ReadCSVNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'readCsv';
    readonly displayName = 'Read CSV';
    readonly visible = true;
    readonly inputs = [
        { name: 'Path', acceptsType: 'core:path', required: false }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        { 
            name: 'filePath', 
            label: 'File path', 
            type: 'filepath' as const, 
            defaultValue: '',
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        },
        {
            name: 'hasHeader',
            label: 'Has Header',
            type: 'boolean' as const,
            defaultValue: true
        },
        {
            name: 'delimiter',
            label: 'Delimiter',
            type: 'text' as const,
            defaultValue: ','
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const filePath = (inputs.Path as string) || (properties.filePath as string);
        if (!filePath) return {};
        try {
            const csvText = await gravityDock.fs.readFile(filePath, 'utf-8');
            const table = aq.fromCSV(csvText, { 
                header: properties.hasHeader !== false, 
                delimiter: properties.delimiter || ',' 
            });
            return { Data: table };
        } catch (err) {
            console.error('Failed to read CSV:', err);
            return {};
        }
    }
}
