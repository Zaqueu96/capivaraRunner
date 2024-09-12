import * as vscode from 'vscode';
import { ServiceManager } from './ServiceManager';
import { ServiceTreeDataProvider } from './ServiceTree';
import { Logger } from './Logger';

export function activate(context: vscode.ExtensionContext) {
    const serviceManager = new ServiceManager();
    const logger = new Logger('CapivaraRunner Output');
    
    serviceManager.loadConfiguration();
    
    const treeDataProvider = new ServiceTreeDataProvider(serviceManager);
    vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.startService', (service) => {
            serviceManager.startService(service);
        }),
        vscode.commands.registerCommand('extension.stopService', (service) => {
            serviceManager.stopService(service);
        }),
        vscode.commands.registerCommand('extension.startAllServices', () => {
            serviceManager.startAllServices();
        }),
        vscode.commands.registerCommand('extension.stopAllServices', () => {
            serviceManager.stopAllServices();
        }),
        vscode.commands.registerCommand('extension.refresh', () => {
            serviceManager.loadConfiguration();
            vscode.window.showInformationMessage('Reloaded configuration!');
        })
    );
}

export function deactivate() {
    const serviceManager = new ServiceManager();
    serviceManager.stopAllServices();
}
