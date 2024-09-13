import * as vscode from 'vscode';
import { ServiceConfig, ServiceManager } from '../main/ServiceManager';
import * as fs from 'fs';
import { start } from 'repl';
import { Logger } from '../main/Logger';


const mockVscode = require('./__mocks__/vscode');

describe('ServiceManager Tests', () => {
    let serviceManager: ServiceManager;
    let logger: Logger;
    const service: ServiceConfig = {
        command: "npm run mock",
        dependsOn: ["dependMock"],
        name: "mockService",
        workingDirectory: "./mockDir"
    };

    const servicesResult = {
        services: [
            {
                name: "System01",
                workingDirectory: "./system01",
                command: "npm run start",
                dependsOn: ["Docker"]
            },
            {
                name: "Docker",
                workingDirectory: "./",
                command: "docker-compose up",
                dependsOn: ["System02"]
            },
            {
                name: "System02",
                workingDirectory: "./system02",
                command: "npm run start",
                dependsOn: []
            },
        ]
    };

    let mockHide = jest.fn();
    let mockSendText = jest.fn();
    let mockDispose = jest.fn();
    beforeEach(() => {
        logger = new Logger("");
        jest.spyOn(vscode.window, "createTerminal").mockImplementation(
            () => ({
                dispose: mockDispose,
                hide: mockHide,
                sendText: mockSendText
            }) as any
        );

        
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(servicesResult));

        serviceManager = new ServiceManager();
    });

    describe('And call load configuration ', () => {

        beforeEach(() => {
            const configPath = '/path/to/config';
        });

        describe('And when file config not exists', () => {
            let spyOnFsExists: any;
            beforeEach(() => {
                spyOnFsExists = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
                serviceManager.loadConfiguration();
            });

            it('Then should call method exists with correct path', () => {
                expect(spyOnFsExists).toHaveBeenCalledWith('\\path\\to\\config\\capivara.config.json');
            });

            it('Then should call method showErrorMessage with correct message', () => {
                expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Config file (capivara.config.json) not found');
            });
        });

        describe('And file config exists', () => {
            beforeEach(() => {
                jest.spyOn(fs, 'existsSync').mockReturnValue(true);
                serviceManager.loadConfiguration();
            });

            it('Then should set correct services on serviceManager', () => {
                expect(serviceManager.getServices()).toStrictEqual(servicesResult.services);
            });
        });
    });

    describe('And call method startService', () => {
        beforeEach(() => {
            serviceManager.startService(service);
        });

        it('Then should call createTerminal with correct params', () => {
            expect(vscode.window.createTerminal).toHaveBeenCalledWith({
                cwd: "C:\\\path\\to\\config\\mockDir",
                name: service.name
            });
        });

        it('Then should call showInformationMessage with correct message', () => {
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(`Starting service: ${service.name}`);
        });

        it('Then should if called method hide', () => {
            expect(mockHide).toHaveBeenCalled();
        });

        it('Then should call method sendText with correct service command', () => {
            expect(mockSendText).toHaveBeenCalledWith(service.command);
        });
    });

    describe('And call method stopService', () => {
        beforeEach(() => {
            serviceManager.startService(service);

            serviceManager.stopService(service);
        });

        it('Then should call showInformationMessage with correct message', () => {
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(`Stopping service: ${service.name}`);
        });

        it('Then should delete service on running process', () => {
            expect(
                serviceManager.getRunningProcess().has(service.name)
            ).toBeFalsy();
        });
    });

    describe('And call method startAllServices', () => {
        beforeEach(() => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            serviceManager.loadConfiguration();

            serviceManager.startAllServices();
        });

        it('Then should call showInformationMessage with correct message', () => {
            expect(vscode.window.showInformationMessage)
                .toHaveBeenCalledWith('Starting all services...');
        });

        it('Then should sortService by depends on terminal execute', () => {
            expect(
                Array.from(serviceManager.getRunningProcess().keys())
            ).toEqual(["System02","Docker", "System01"]);
        });
    });

    describe('And call method stoptAllServices', () => {

        beforeEach(() => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            serviceManager.loadConfiguration();

            serviceManager.stopAllServices();
        });

        it('Then should call showInformationMessage with correct message', () => {
            expect(vscode.window.showInformationMessage)
                .toHaveBeenCalledWith('Stopping all services...');
        });

        it('Then should returns empty array on running process', () => {
            expect(
                Array.from(serviceManager.getRunningProcess().keys())
            ).toEqual([]);
        });
    });
});
