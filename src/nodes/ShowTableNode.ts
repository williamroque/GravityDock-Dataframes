import { RenderNode } from '@gravitydock/types';

export class ShowTableNode extends RenderNode {
    readonly category = { name: 'Render', accent: 'purple-400' } as any;
    readonly typeId = 'showTable';
    readonly displayName = 'Show Table';
    readonly visible = true;
    readonly inputs = [
        { name: 'Data', acceptsType: 'core:dataframe' }
    ];
    readonly outputs = [];
    readonly properties = [];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>): Promise<Record<string, any>> {
        const table = inputs['Data'];
        if (!table) return {};

        return { type: 'core:dataframe', content: table };
    }
}
