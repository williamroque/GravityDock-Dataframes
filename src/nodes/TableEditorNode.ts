import { InteractiveNode } from '@gravitydock/types';

export class TableEditorNode extends InteractiveNode {
    readonly typeId = 'dataframes:tableEditor';
    readonly displayName = 'Table Editor';
    readonly nodeInterface = 'interactive';
    readonly category = { name: 'Wrangling', accent: 'emerald-500' } as any;
    readonly visible = true;
    
    readonly inputs = [];
    
    readonly outputs = [
        { name: 'Data', outputType: 'core:dataframe' }
    ];
    
    readonly properties = [
        { name: 'tableData', type: 'object', defaultValue: null, hidden: true }
    ];

    async evaluate(inputs: Record<string, any>, properties: Record<string, any>) {
        if (properties.tableData) {
            return { Data: { __arqueroData: properties.tableData } };
        }
        return {};
    }
}
