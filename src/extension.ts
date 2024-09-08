import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, exec, spawn } from 'child_process';
import terminate from 'terminate';
interface ServiceConfig {
	name: string;
	workingDirectory: string;
	command: string;
	dependsOn: string[];
}

let services: ServiceConfig[] = [];
const outputChannel = vscode.window.createOutputChannel('Service Output');
const runningProcesses = new Map<string, ChildProcess>();


export function activate(context: vscode.ExtensionContext) {
	loadConfiguration();
}

function loadConfiguration() {
	const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
	if (fs.existsSync(configPath)) {
		const configFile = fs.readFileSync(configPath, 'utf-8');
		services = JSON.parse(configFile).services;
	} else {
		vscode.window.showErrorMessage('Config file not found');
	}

	const treeDataProvider = new ServiceTreeDataProvider(services);
	vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);
}

function executeCommandOnOutputChannel(service: ServiceConfig) {
	const [command, ...args] = `${service.command}`.split(' ');
	const workingDirectory = path.resolve(vscode.workspace.rootPath || '', service.workingDirectory);

	const child = spawn(command, args, { cwd: workingDirectory, shell: true });

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

vscode.commands.registerCommand('extension.startService', (event: any) => {
	const service: ServiceConfig = (event?.service) as ServiceConfig;
	vscode.window.showInformationMessage(`Starting service: ${service.name}`);
	// executeCommandOnTerminals(service);
	executeCommandOnOutputChannel(service);
});

vscode.commands.registerCommand('extension.stopService', (event: any) => {
	const service: ServiceConfig = (event?.service) as ServiceConfig;
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
		const service = services.find(v=> v.name == name);
		if(service) stopServiceAndKillProcess(service);
	});
});

vscode.commands.registerCommand('extension.refresh', () => {
	try {
		loadConfiguration();
		vscode.window.showInformationMessage('Reloaded configuration!');
	} catch (err) {
		outputChannel.appendLine("[CapivaraRunner] Error on load capivara.config.json");
		outputChannel.appendLine("[CapivaraRunner] " + err);
		vscode.window.showErrorMessage("Error on load capivara.config.json");
	}

});

function stopServiceAndKillProcess(service: ServiceConfig) {
	const process = runningProcesses.get(service.name);
	try{
		if (process && process.pid) {
			terminate(process.pid, () => {
				outputChannel.appendLine(`[${service.name}] Terminate process with success`)
			});
			runningProcesses.delete(service.name);
		} else {
			vscode.window.showWarningMessage(`No running process found for service: ${service.name}`);
		}
	} catch(error) {
		vscode.window.showErrorMessage(`${service.name}] error on stop service`);
		outputChannel.appendLine(`[${service.name}] Error  on terminate `)
		outputChannel.appendLine(`[${service.name}] ${error}`)
	}	
}

function executeCommandOnTerminals(service: ServiceConfig) {
	const terminal = vscode.window.createTerminal(service.name);
	terminal.sendText(`cd ${service.workingDirectory}`);
	terminal.sendText(service.command);
	terminal.show();
}

