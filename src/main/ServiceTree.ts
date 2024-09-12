import * as vscode from 'vscode';
import { ServiceManager } from './ServiceManager';

export class ServiceTreeDataProvider implements vscode.TreeDataProvider<ServiceItem> {
    constructor(private serviceManager: ServiceManager) { }

    getTreeItem(element: ServiceItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ServiceItem): Thenable<ServiceItem[]> {
        if (!element) {
            return Promise.resolve(
                this.serviceManager.getServices().map(
                    service => new ServiceItem(service, this.serviceManager.isRunning(service))
                )
            );
        }
        return Promise.resolve([]);
    }
}

class ServiceItem extends vscode.TreeItem {
    constructor(public service: any, isRunning: boolean) {
        super(service.name, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon(isRunning ? 'debug-stop' : 'play');
        this.command = {
            title: `${isRunning ? 'Stop' : 'Start'} Service`,
            command: isRunning ? 'extension.stopService' : 'extension.startService',
            arguments: [service]
        };
    }
}
