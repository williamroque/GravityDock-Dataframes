import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';
import { extractTable } from '../utils';

export class AsMarkdownNode extends BaseNode {
    readonly category = { name: 'I/O', accent: 'sky-500' } as any;
    readonly typeId = 'asMarkdown';
    readonly displayName = 'As Markdown';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [
        { name: 'Markdown', outputType: 'core:string' }
    ];
    readonly properties = [
        {
            name: 'limit',
            label: 'Max Rows',
            description: 'Maximum number of rows to include (0 for all rows)',
            type: 'number' as const,
            defaultValue: 0
        },
        {
            name: 'maxDigits',
            label: 'Max Fractional Digits',
            description: 'Maximum number of fractional digits for numbers',
            type: 'number' as const,
            defaultValue: 6
        }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const rawData = inputs['Data'];
        if (!rawData) return { Markdown: '' };

        const table = extractTable(rawData) || (rawData as aq.internal.Table);
        if (!table || typeof table.toMarkdown !== 'function') return { Markdown: '' };

        if (typeof table.numCols === 'function' && table.numCols() === 0) {
            return { Markdown: '' };
        }

        try {
            const limitVal = properties?.limit !== undefined && properties?.limit !== null && properties?.limit !== ''
                ? Number(properties.limit)
                : 0;

            const options: any = {};
            if (limitVal > 0) {
                options.limit = limitVal;
            }

            const maxDigitsVal = properties?.maxDigits !== undefined && properties?.maxDigits !== null && properties?.maxDigits !== ''
                ? Number(properties.maxDigits)
                : undefined;
            if (maxDigitsVal !== undefined && !isNaN(maxDigitsVal) && maxDigitsVal >= 0) {
                options.maxdigits = maxDigitsVal;
            }

            const markdown = table.toMarkdown(options);
            return { Markdown: markdown };
        } catch (err) {
            console.error('Failed to format dataframe as markdown:', err);
            return { Markdown: '' };
        }
    }
}
