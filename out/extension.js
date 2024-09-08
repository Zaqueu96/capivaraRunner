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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let services = [];
function activate(context) {
    const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
    // Carregar arquivo de configuração
    if (fs.existsSync(configPath)) {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        services = JSON.parse(configFile).services;
    }
    else {
        vscode.window.showErrorMessage('Config file not found');
    }
    // Criar e registrar TreeView
    const treeDataProvider = new ServiceTreeDataProvider(services);
    vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);
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
        // Inicializa a propriedade 'service'
        this.service = service;
        // Define o ícone padrão do TreeItem principal
        this.iconPath = new vscode.ThemeIcon('play-circle');
        // Adiciona os botões inline de Start e Stop
        this.command = {
            command: `extension.startService`,
            title: "Start Service",
            arguments: [this.service]
        };
        this.contextValue = 'serviceItem'; // Define um contexto para os comandos
        // Customiza as opções de tooltip e description
        this.description = `Cmd: ${this.service.command}`;
        this.tooltip = `WorkDir: ${this.service.workingDirectory}`;
    }
}
// Registra o comando start e stop para cada serviço dinamicamente
vscode.commands.registerCommand('extension.startService', (service) => {
    vscode.window.showInformationMessage(`Starting service: ${service.name}`);
    const terminal = vscode.window.createTerminal(service.name);
    terminal.sendText(`cd ${service.workingDirectory}`);
    terminal.sendText(service.command);
    terminal.show();
});
vscode.commands.registerCommand('extension.stopService', (service) => {
    vscode.window.showInformationMessage(`Stopping service: ${service.name}`);
    // Lógica para parar o serviço (se aplicável)
});
vscode.commands.registerCommand('extension.startAllServices', () => {
    vscode.window.showInformationMessage('Starting all services...');
    services.forEach(service => {
        const terminal = vscode.window.createTerminal(service.name);
        terminal.sendText(`cd ${service.workingDirectory}`);
        terminal.sendText(service.command);
        terminal.show();
    });
});
vscode.commands.registerCommand('extension.stopAllServices', () => {
    vscode.window.showInformationMessage('Stopping all services...');
    // Adicionar lógica para parar todos os serviços, caso aplicável
});
//# sourceMappingURL=extension.js.map