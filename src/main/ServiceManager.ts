import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';
import terminate from 'terminate';
import { Logger } from './Logger';

export interface ServiceConfig {
    name: string;
    workingDirectory: string;
    command: string;
    dependsOn: string[];
}

export class ServiceManager {
    private services: ServiceConfig[] = [];
    private runningProcesses = new Map<string, any>();
    private logger = new Logger('CapivaraRunner Output');

    constructor(){
        this.getServices = this.getServices.bind(this);
    }

    public getServices():ServiceConfig[] {
        return this.services;
    }

    public isRunning(service:ServiceConfig):boolean {
        return this.runningProcesses.has(service.name);
    }

    public loadConfiguration() {
        const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf-8');
            this.services = JSON.parse(configFile).services;
        } else {
            vscode.window.showErrorMessage('Config file (capivara.config.json) not found');
        }
    }

    public startService(service: ServiceConfig) {
        this.capivaraRunnerCommand(service);
    }

    public stopService(service: ServiceConfig) {
        vscode.window.showInformationMessage(`Stopping service: ${service.name}`);
        this.terminateProcess(service);
    }

    public startAllServices() {
        this.logger.log("Starting all services...");
        vscode.window.showInformationMessage('Starting all services...');
        this.getServicesByDependsOn().forEach(service => this.capivaraRunnerCommand(service));
    }

    public stopAllServices() {
        vscode.window.showInformationMessage('Stopping all services...');
        this.runningProcesses.forEach((process, name) => {
            const service = this.services.find(s => s.name === name);
            if (service) this.terminateProcess(service);
        });
    }

    private capivaraRunnerCommand(service: ServiceConfig) {
        
        this.logger.log(`starting service: ${service.name}`);

        if(this.runningProcesses.has(service.name)){
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
            if (process.pid) {
                terminate(process.pid, () => {
                    this.logger.log(`[${service.name}] Terminated successfully.`);
                    this.runningProcesses.delete(service.name);
                });
            } else {
                process.dispose();
                this.runningProcesses.delete(service.name);
            }
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
