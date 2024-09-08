"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const terminate_1 = __importDefault(require("terminate"));
let services = [];
const outputChannel = vscode.window.createOutputChannel('Service Output');
const runningProcesses = new Map();
function activate(context) {
    loadConfiguration();
}
function loadConfiguration() {
    const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        services = JSON.parse(configFile).services;
    }
    else {
        vscode.window.showErrorMessage('Config file not found');
    }
    const treeDataProvider = new ServiceTreeDataProvider(services);
    vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);
}
function executeCommandOnOutputChannel(service) {
    const [command, ...args] = `${service.command}`.split(' ');
    const workingDirectory = path.resolve(vscode.workspace.rootPath || '', service.workingDirectory);
    const child = (0, child_process_1.spawn)(command, args, { cwd: workingDirectory, shell: true });
    runningProcesses.set(service.name, child);
    child.stdout.on('data', (data) => {
        outputChannel.appendLine(`[${service.name}]: ${data}`);
    });
    child.stderr.on('data', (data) => {
        outputChannel.appendLine(`[${service.name}] Error: ${data}`);
    });
    child.on('error', (error) => {
        outputChannel.appendLine(`[${service.name}] Error: ${error.message}`);
    });
    child.on('close', (code) => {
        outputChannel.appendLine(`[${service.name}]: Process exited with code ${code}`);
    });
    outputChannel.show(true);
}
class ServiceTreeDataProvider {
    services;
    constructor(services) {
        this.services = services;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.services.map(service => new ServiceItem(service)));
        }
        return Promise.resolve([]);
    }
}
class ServiceItem extends vscode.TreeItem {
    service;
    constructor(service) {
        super(service.name, vscode.TreeItemCollapsibleState.None);
        this.service = service;
        this.iconPath = new vscode.ThemeIcon('play-circle');
        this.command = {
            command: `extension.startService`,
            title: "Start Service",
            arguments: [this.service]
        };
        this.contextValue = 'serviceItem';
        this.description = `Cmd: ${this.service.command}`;
        this.tooltip = `WorkDir: ${this.service.workingDirectory}`;
    }
}
vscode.commands.registerCommand('extension.startService', (event) => {
    const service = (event?.service);
    vscode.window.showInformationMessage(`Starting service: ${service.name}`);
    // executeCommandOnTerminals(service);
    executeCommandOnOutputChannel(service);
});
vscode.commands.registerCommand('extension.stopService', (event) => {
    const service = (event?.service);
    vscode.window.showInformationMessage(`Stopping service: ${service.name}`);
    stopServiceAndKillProcess(service);
});
vscode.commands.registerCommand('extension.startAllServices', () => {
    vscode.window.showInformationMessage('Starting all services...');
    services.forEach(service => {
        //executeCommandOnTerminals(service);
        executeCommandOnOutputChannel(service);
    });
});
vscode.commands.registerCommand('extension.stopAllServices', () => {
    vscode.window.showInformationMessage('Stopping all services...');
    runningProcesses.forEach((process, name) => {
        const service = services.find(v => v.name == name);
        if (service)
            stopServiceAndKillProcess(service);
    });
});
vscode.commands.registerCommand('extension.refresh', () => {
    try {
        loadConfiguration();
        vscode.window.showInformationMessage('Reloaded configuration!');
    }
    catch (err) {
        outputChannel.appendLine("[CapivaraRunner] Error on load capivara.config.json");
        outputChannel.appendLine("[CapivaraRunner] " + err);
        vscode.window.showErrorMessage("Error on load capivara.config.json");
    }
});
function stopServiceAndKillProcess(service) {
    const process = runningProcesses.get(service.name);
    try {
        if (process && process.pid) {
            (0, terminate_1.default)(process.pid, () => {
                outputChannel.appendLine(`[${service.name}] Terminate process with success`);
            });
            runningProcesses.delete(service.name);
        }
        else {
            vscode.window.showWarningMessage(`No running process found for service: ${service.name}`);
        }
    }
    catch (error) {
        vscode.window.showErrorMessage(`${service.name}] error on stop service`);
        outputChannel.appendLine(`[${service.name}] Error  on terminate `);
        outputChannel.appendLine(`[${service.name}] ${error}`);
    }
}
function executeCommandOnTerminals(service) {
    const terminal = vscode.window.createTerminal(service.name);
    terminal.sendText(`cd ${service.workingDirectory}`);
    terminal.sendText(service.command);
    terminal.show();
}
//# sourceMappingURL=extension.js.map