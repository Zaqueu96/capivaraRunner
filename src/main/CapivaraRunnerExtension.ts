import * as vscode from 'vscode';
import { ServiceManager } from './ServiceManager';
import { ServiceTreeDataProvider } from './ServiceTree';
import {
    EXTENSION_START_SERVICE,
    EXTENSION_STOP_SERVICE,
    EXTENSION_START_ALL_SERVICES,
    EXTENSION_STOP_ALL_SERVICES,
    EXTENSION_REFRESH
} from './Constants';


export function activate(context: vscode.ExtensionContext) {
    const serviceManager = new ServiceManager();
    
    serviceManager.loadConfiguration();

    const treeDataProvider = new ServiceTreeDataProvider(serviceManager);
    vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand(EXTENSION_START_SERVICE, (service) => {
            serviceManager.startService(service);
        }),
        vscode.commands.registerCommand(EXTENSION_STOP_SERVICE, (service) => {
            serviceManager.stopService(service);
        }),
        vscode.commands.registerCommand(EXTENSION_START_ALL_SERVICES, () => {
            serviceManager.startAllServices();
        }),
        vscode.commands.registerCommand(EXTENSION_STOP_ALL_SERVICES, () => {
            serviceManager.stopAllServices();
        }),
        vscode.commands.registerCommand(EXTENSION_REFRESH, () => {
            serviceManager.loadConfiguration();
        })
    );
}

