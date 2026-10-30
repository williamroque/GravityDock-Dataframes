import { TableEditorFrontend } from './frontends/TableEditorFrontend';

declare const window: any;

if (window.GravityDockUI && window.GravityDockUI.registerInteractiveFrontend) {
    window.GravityDockUI.registerInteractiveFrontend({
        typeIds: ['dataframes:tableEditor'],
        component: TableEditorFrontend,
        packageId: 'com.gravitydock.dataframes'
    });
}
