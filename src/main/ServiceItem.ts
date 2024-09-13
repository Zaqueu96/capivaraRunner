import * as vscode from 'vscode';
import { EXTENSION_START_SERVICE, EXTENSION_STOP_SERVICE } from './Constants';

export class ServiceItem extends vscode.TreeItem {
    constructor(public service: any, isRunning: boolean) {
        super(service.name, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon(isRunning ? 'debug-stop' : 'play');
        this.command = {
            title: `${isRunning ? 'Stop' : 'Start'} Service`,
            command: isRunning ? EXTENSION_STOP_SERVICE : EXTENSION_START_SERVICE,
            arguments: [service]
        };
    }
}