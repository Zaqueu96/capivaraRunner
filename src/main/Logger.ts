import * as vscode from 'vscode';

export class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor(name: string) {
        this.outputChannel = vscode.window.createOutputChannel(name);
    }

    public log(message: string) {
        this.outputChannel.appendLine(`[CapivaraRunner] ${message}`);
    }

    public show() {
        this.outputChannel.show(true);
    }
}
