import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './Logger';
import { ServiceTreeDataProvider } from './ServiceTree';

export interface ServiceConfig {
    name: string;
    workingDirectory: string;
    command: string;
    dependsOn: string[];
}

enum ConfigurationMessageEnum {
    CONFIG_NOT_FOUND = "config_not_found",
    CONFIG_LOAD_ERROR = "config_load_error",
    CONFIG_LOAD_EMPTY = "config_load_empty",
    CONFIG_LOAD_SUCCESS = "config_load_successd"
}
export class ServiceManager {
    private services: ServiceConfig[] = [];
    private runningProcesses = new Map<string, any>();
    private configMessage: ConfigurationMessageEnum
        = ConfigurationMessageEnum.CONFIG_LOAD_SUCCESS;
    private logger = new Logger('CapivaraRunner Output');

    private messagesOnChildrenDefault = {
        [ConfigurationMessageEnum.CONFIG_NOT_FOUND]: "Config file (capivara.config.json) not found.",
        [ConfigurationMessageEnum.CONFIG_LOAD_ERROR]: "Error on load configuration. check logs.",
        [ConfigurationMessageEnum.CONFIG_LOAD_EMPTY]: "No services found.",
        [ConfigurationMessageEnum.CONFIG_LOAD_SUCCESS]: ""
    };

    constructor() {
        this.getServices = this.getServices.bind(this);
    }

    public getMessageDefault(): string {
        return this.messagesOnChildrenDefault[this.configMessage];
    }
    public getServices(): ServiceConfig[] {
        return this.services;
    }

    public getRunningProcess(): Map<string, any> {
        return this.runningProcesses;
    }

    public isRunning(service: ServiceConfig): boolean {
        return this.runningProcesses.has(service.name);
    }
    private showConfigNotFound() {
        vscode.window.showErrorMessage('Config file (capivara.config.json) not found');
    }

    private refreshTreeProvider() {
        const treeDataProvider = new ServiceTreeDataProvider(this);
        vscode.window.registerTreeDataProvider('capivaraTreeView', treeDataProvider);
    }

    public loadConfiguration() {
        const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf-8');
            try {
                const objectJsonParsed = JSON.parse(configFile);
                if (objectJsonParsed.services) {
                    this.services = objectJsonParsed.services;
                    this.configMessage = ConfigurationMessageEnum.CONFIG_LOAD_SUCCESS;
                } else {
                    this.configMessage = ConfigurationMessageEnum.CONFIG_LOAD_EMPTY;
                }

            } catch (error) {
                vscode.window.showErrorMessage("Error on load configuration. check logs");
                this.logger.log(`error on loading configuration: ${error}`);
                this.configMessage = ConfigurationMessageEnum.CONFIG_LOAD_ERROR;
            } 

        } else {
            this.configMessage = ConfigurationMessageEnum.CONFIG_NOT_FOUND;
            this.showConfigNotFound();
        }

        this.refreshTreeProvider();

    }

    public startService(service: ServiceConfig) {
        this.capivaraRunnerCommand(service);
        this.refreshTreeProvider();
    }

    public stopService(service: ServiceConfig) {
        vscode.window.showInformationMessage(`Stopping service: ${service.name}`);
        this.terminateProcess(service);
        this.refreshTreeProvider();
    }

    public startAllServices() {
        if (this.runningProcesses.size === this.services.length) {
            return;
        }
        this.logger.log("Launching all services.");
        vscode.window.showInformationMessage('Launching all services');

        this.getServicesByDependsOn().forEach(service => this.capivaraRunnerCommand(service));

        this.refreshTreeProvider();
    }

    public stopAllServices() {
        if (this.runningProcesses.size === 0) { return; }
        vscode.window.showInformationMessage('Stopping all services...');
        this.runningProcesses.forEach((process, name) => {
            const service = this.services.find(s => s.name === name);
            if (service) {
                this.terminateProcess(service);
            }
        });

        this.refreshTreeProvider();
    }

    private capivaraRunnerCommand(service: ServiceConfig) {

        this.logger.log(`starting service: ${service.name}`);

        if (this.runningProcesses.has(service.name)) {
            this.logger.log(`service: ${service.name} already on terminal`);
            return;
        }

        vscode.window.showInformationMessage(`Starting service: ${service.name}`);
        this.executeCommandOnTerminals(service);
    }

    private executeCommandOnTerminals(service: ServiceConfig) {
        const workingDirectory = path.resolve(vscode.workspace.rootPath || '', service.workingDirectory);
        const terminal = vscode.window.createTerminal({
            cwd: workingDirectory,
            name: service.name,
        });
        this.runningProcesses.set(service.name, terminal);
        terminal.sendText(service.command);
        terminal.hide();
    }

    private terminateProcess(service: ServiceConfig) {
        const process = this.runningProcesses.get(service.name);
        if (process) {
            process.dispose();
            this.runningProcesses.delete(service.name);
        } else {
            vscode.window.showWarningMessage(`No running process found for service: ${service.name}`);
        }
    }

    private getServicesByDependsOn(): ServiceConfig[] {
        const services = this.services;
        const sortedServices: ServiceConfig[] = [];
        const processedServices = new Set<string>();

        function processService(service: ServiceConfig) {
            if (processedServices.has(service.name)) {
                return;
            }

            service.dependsOn.forEach(dep => {
                const dependentService = services.find(s => s.name === dep);
                if (dependentService) {
                    processService(dependentService);
                }
            });

            sortedServices.push(service);
            processedServices.add(service.name);
        }

        services.forEach(service => processService(service));

        return sortedServices;
    }
}
