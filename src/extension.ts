import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface ServiceConfig {
	name: string;
	workingDirectory: string;
	command: string;
	dependsOn: string[];
}

let services: ServiceConfig[] = [];

export function activate(context: vscode.ExtensionContext) {
	const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');

	// Carregar arquivo de configuração
	if (fs.existsSync(configPath)) {
		const configFile = fs.readFileSync(configPath, 'utf-8');
		services = JSON.parse(configFile).services;
	} else {
		vscode.window.showErrorMessage('Config file not found');
	}

	// Criar e registrar TreeView
	const treeDataProvider = new ServiceTreeDataProvider(services);
	vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);
}

class ServiceTreeDataProvider implements vscode.TreeDataProvider<ServiceItem> {
	constructor(private services: ServiceConfig[]) { }

	getTreeItem(element: ServiceItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ServiceItem): Thenable<ServiceItem[]> {
		if (!element) {
			return Promise.resolve(
				this.services.map(service => new ServiceItem(service))
			);
		}
		return Promise.resolve([]);
	}
}

class ServiceItem extends vscode.TreeItem {
	service: ServiceConfig;

	constructor(service: ServiceConfig) {
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
vscode.commands.registerCommand('extension.startService', (service: ServiceConfig) => {
	vscode.window.showInformationMessage(`Starting service: ${service.name}`);
	const terminal = vscode.window.createTerminal(service.name);
	terminal.sendText(`cd ${service.workingDirectory}`);
	terminal.sendText(service.command);
	terminal.show();
});

vscode.commands.registerCommand('extension.stopService', (service: ServiceConfig) => {
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
