import { ExecuteNode } from '@gravitydock/types';
import * as aq from 'arquero';
import * as XLSX from 'xlsx';

import type { GravityDockAPI } from '@gravitydock/types';

declare const gravityDock: GravityDockAPI;

export class WriteExcelNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'writeExcel';
    readonly displayName = 'Write Excel';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' },
        { name: 'Path', acceptsType: 'core:path', required: false }
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
            name: 'sheetName',
            label: 'Sheet Name',
            type: 'string' as const,
            defaultValue: 'Sheet1'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        const filePath = (inputs['Path'] as string) || (properties.filePath as string);
        
        if (!table || !filePath) return {};

        try {
            // Convert to JSON array of objects
            const jsonData = table.objects();
            
            // Create a new workbook and add the worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(jsonData);
            XLSX.utils.book_append_sheet(workbook, worksheet, properties.sheetName || 'Sheet1');
            
            // Generate binary buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            await gravityDock.fs.writeFile(filePath, excelBuffer);
            return {};
        } catch (err) {
            console.error('Failed to write Excel:', err);
            return {};
        }
    }
}
