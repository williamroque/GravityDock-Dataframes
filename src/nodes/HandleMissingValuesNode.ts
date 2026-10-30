import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class HandleMissingValuesNode extends BaseNode {
    readonly category = { name: 'Cleaning', accent: 'amber-500' } as any;
    readonly typeId = 'handleMissingValues';
    readonly displayName = 'Handle Missing Values';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'action',
            label: 'Action',
            type: 'select' as const,
            options: [
                { label: 'Drop Rows with NAs', value: 'drop' },
                { label: 'Fill with Value', value: 'fill' }
            ],
            defaultValue: 'drop'
        },
        {
            name: 'fillValue',
            label: 'Fill Value (if filling)',
            type: 'text' as const,
            defaultValue: '0'
        },
        {
            name: 'columns',
            label: 'Target Columns (empty for all)',
            type: 'text' as const,
            defaultValue: ''
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const action = properties.action as string;
        const fillValue = properties.fillValue as string;
        
        const colsStr = properties.columns as string || '';
        const cols = colsStr.split(',').map(c => c.trim()).filter(c => c);

        try {
            if (action === 'drop') {
                let newTable: aq.internal.Table;
                if (cols.length > 0) {
                    // Filter where all specified columns are valid
                    const filterArgs = cols.map(c => `d['${c}'] != null && d['${c}'] === d['${c}']`).join(' && ');
                    const filterFn = new Function('d', `return ${filterArgs}`);
                    newTable = table.filter(aq.escape((d: any) => filterFn(d)));
                } else {
                    // Arquero doesn't have dropna() out of the box, need to filter
                    // If no cols specified, drop if ANY column is invalid
                    const colNames = table.columnNames();
                    const filterArgs = colNames.map(c => `d['${c}'] != null && d['${c}'] === d['${c}']`).join(' && ');
                    const filterFn = new Function('d', `return ${filterArgs}`);
                    newTable = table.filter(aq.escape((d: any) => filterFn(d)));
                }
                return { Data: newTable };
            } else {
                // Fill value
                // In Arquero, derive using op.coalesce
                const deriveObj: any = {};
                const targetCols = cols.length > 0 ? cols : table.columnNames();
                
                // Attempt to parse fillValue as number if possible
                let parsedVal: any = fillValue;
                if (!isNaN(Number(fillValue)) && fillValue.trim() !== '') {
                    parsedVal = Number(fillValue);
                } else if (fillValue === 'true') parsedVal = true;
                else if (fillValue === 'false') parsedVal = false;

                for (const col of targetCols) {
                    const fn = new Function('d', 'val', `return (d['${col}'] != null && d['${col}'] === d['${col}']) ? d['${col}'] : val`);
                    deriveObj[col] = aq.escape((d: any) => fn(d, parsedVal));
                }
                const newTable = table.derive(deriveObj);
                return { Data: newTable };
            }
        } catch (err) {
            console.error('Failed to handle missing values:', err);
            return {};
        }
    }
}
