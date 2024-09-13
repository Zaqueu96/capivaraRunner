import * as vscode from 'vscode';
import { ServiceManager } from './ServiceManager';
import { ServiceItem } from './ServiceItem';

export class ServiceTreeDataProvider implements vscode.TreeDataProvider<ServiceItem> {
    constructor(private serviceManager: ServiceManager) { }

    public getTreeItem(element: ServiceItem): vscode.TreeItem {
        return element;
    }

    public getChildren(element?: ServiceItem): Thenable<ServiceItem[]> {
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


