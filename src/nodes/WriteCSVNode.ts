import { ExecuteNode } from '@tracereactive/types';
import * as aq from 'arquero';

import type { TraceReactiveAPI } from '@tracereactive/types';

declare const traceReactive: TraceReactiveAPI;

export class WriteCSVNode extends ExecuteNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'writeCsv';
    readonly displayName = 'Write CSV';
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
            name: 'delimiter',
            label: 'Delimiter',
            type: 'text' as const,
            defaultValue: ','
        },
        {
            name: 'append',
            label: 'Append to file',
            type: 'boolean' as const,
            defaultValue: false
        }
    ];

    private lastWrittenCsvStr?: string;
    private lastWrittenPath?: string;
    private writeQueue: Promise<any> = Promise.resolve();

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        const filePath = (inputs['Path'] as string) || (properties.filePath as string);
        
        if (!table || !filePath) return {};

        return new Promise((resolve) => {
            this.writeQueue = this.writeQueue.then(async () => {
                try {
                    let delimiter = properties.delimiter || ',';
                    let csvOptions: any = { delimiter };

                    const rawCsvStr = table.toCSV({ delimiter });

                    if (properties.append && this.lastWrittenCsvStr === rawCsvStr && this.lastWrittenPath === filePath) {
                        resolve({});
                        return;
                    }

                    if (properties.append) {
                        let fileExists = false;
                        try {
                            await traceReactive.fs.stat(filePath);
                            fileExists = true;
                        } catch (e) {
                            fileExists = false;
                        }

                        if (fileExists) {
                            try {
                                const existingData = await traceReactive.fs.readFile(filePath, 'utf-8');
                                if (existingData && existingData.trim().length > 0) {
                                    const firstNewlineIdx = existingData.indexOf('\n');
                                    let headerLine = firstNewlineIdx !== -1 ? existingData.substring(0, firstNewlineIdx) : existingData;
                                    headerLine = headerLine.replace(/\r$/, '');
                                    
                                    const dummyTable = aq.fromCSV(headerLine + '\n' + headerLine, { delimiter });
                                    const existingColumns = dummyTable.columnNames();
                                    csvOptions.columns = existingColumns;

                                    let finalTable = table;
                                    const missingCols = existingColumns.filter(c => !finalTable.columnNames().includes(c));
                                    if (missingCols.length > 0) {
                                        const deriveExpr: Record<string, any> = {};
                                        for (const c of missingCols) {
                                            deriveExpr[c] = aq.escape(null);
                                        }
                                        finalTable = finalTable.derive(deriveExpr);
                                    }

                                    let csvStr = finalTable.toCSV(csvOptions);
                                    
                                    const generatedNewlineIdx = csvStr.indexOf('\n');
                                    if (generatedNewlineIdx !== -1) {
                                        csvStr = csvStr.substring(generatedNewlineIdx + 1);
                                    } else {
                                        csvStr = '';
                                    }

                                    if (csvStr) {
                                        const separator = existingData.endsWith('\n') ? '' : '\n';
                                        await traceReactive.fs.writeFile(filePath, existingData + separator + csvStr);
                                    }
                                    this.lastWrittenCsvStr = rawCsvStr;
                                    this.lastWrittenPath = filePath;
                                    resolve({});
                                    return;
                                }
                            } catch (err) {
                                console.error('Append error:', err);
                                resolve({});
                                return;
                            }
                        }
                    }

                    const csvStr = table.toCSV(csvOptions);
                    await traceReactive.fs.writeFile(filePath, csvStr);
                    this.lastWrittenCsvStr = rawCsvStr;
                    this.lastWrittenPath = filePath;
                    resolve({});
                } catch (err) {
                    console.error('Failed to write CSV:', err);
                    resolve({});
                }
            });
        });
    }
}
