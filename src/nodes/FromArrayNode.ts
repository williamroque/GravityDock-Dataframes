import { BaseNode } from '@gravitydock/types';
import * as aq from 'arquero';

export class FromArrayNode extends BaseNode {
    readonly category = { name: 'Creation', accent: 'emerald-500' } as any;
    readonly typeId = 'fromArray';
    readonly displayName = 'From Array';
    readonly visible = true;
    
    readonly inputs = [
        { name: 'Array', acceptsType: 'core:array' }
    ];
    
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    
    readonly properties = [];

    async evaluate(inputs: Record<string, any>): Promise<Record<string, any>> {
        const arr = inputs['Array'];
        if (!Array.isArray(arr)) return {};

        try {
            const index = arr.map((_, i) => i);
            const table = aq.table({ index, value: arr });
            return { Data: table };
        } catch (err) {
            console.error('Failed to create dataframe from array:', err);
            return {};
        }
    }
}
