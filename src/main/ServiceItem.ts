import * as vscode from 'vscode';

export class ServiceItem extends vscode.TreeItem {
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