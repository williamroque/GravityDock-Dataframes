import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class ParseLocaleNumberNode extends BaseNode {
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly typeId = 'parseLocaleNumber';
    readonly displayName = 'Parse Locale Number';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    readonly properties = [
        {
            name: 'columnName',
            label: 'Column Name',
            type: 'text' as const,
            defaultValue: ''
        },
        {
            name: 'decimalSeparator',
            label: 'Decimal Separator',
            type: 'text' as const,
            defaultValue: ','
        },
        {
            name: 'thousandsSeparator',
            label: 'Thousands Separator',
            type: 'text' as const,
            defaultValue: '.'
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'] as aq.internal.Table | undefined;
        if (!table) return {};
        
        const colName = properties.columnName as string;
        if (!colName) return { Data: table };

        const decimalSeparator = (properties.decimalSeparator as string) || '.';
        const thousandsSeparator = properties.thousandsSeparator as string;

        try {
            const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            const parseFn = (d: any) => {
                let val = String(d[colName] ?? '');
                
                if (thousandsSeparator) {
                    const tsRegex = new RegExp(escapeRegExp(thousandsSeparator), 'g');
                    val = val.replace(tsRegex, '');
                }

                if (decimalSeparator && decimalSeparator !== '.') {
                    const dsRegex = new RegExp(escapeRegExp(decimalSeparator), 'g');
                    val = val.replace(dsRegex, '.');
                }

                val = val.replace(/[^\d\.-]/g, '');
                
                if (val === '' || val === '-' || val === '.') return NaN;
                
                return Number(val);
            };
            
            const newTable = table.derive({
                [colName]: aq.escape(parseFn)
            });
            return { Data: newTable };
        } catch (err) {
            console.error('Failed to parse locale number:', err);
            return {};
        }
    }
}
