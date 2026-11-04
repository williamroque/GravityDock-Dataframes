import { ExecuteNode } from '@gravitydock/types';
import * as aq from 'arquero';
import * as XLSX from 'xlsx';
import { extractTable } from '../utils';

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
        const rawData = inputs['Data'];
        const filePath = (inputs['Path'] as string) || (properties.filePath as string);
        
        if (!rawData || !filePath) return {};

        try {
            const table = extractTable(rawData);
            let jsonData: any[] = [];

            if (table && typeof table.objects === 'function') {
                jsonData = table.objects();
            } else if (Array.isArray(rawData)) {
                jsonData = rawData;
            } else if (rawData && Array.isArray(rawData.__arqueroData)) {
                jsonData = rawData.__arqueroData;
            } else if (rawData && Array.isArray(rawData.rows)) {
                jsonData = rawData.rows;
            } else if (typeof (rawData as any).objects === 'function') {
                jsonData = (rawData as any).objects();
            }

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(jsonData);
            XLSX.utils.book_append_sheet(workbook, worksheet, properties.sheetName || 'Sheet1');
            
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            await gravityDock.fs.writeFile(filePath, excelBuffer);
            return {};
        } catch (err) {
            console.error('Failed to write Excel:', err);
            return {};
        }
    }
}
