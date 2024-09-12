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

    beforeEach(() => {
        logger = new Logger("");
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
                expect(spyOnFsExists).toHaveBeenCalledWith('\\path\\to\\config\\capivara.config.json')
            });

            it('Then should call method showErrorMessage with correct message', () => {
                expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Config file (capivara.config.json) not found')
            });
        });

        describe('And file config exists', () => {
            const servicesResult = {
                services: [{
                    name: "System01",
                    workingDirectory: "./system01",
                    command: "npm run start",
                    dependsOn: []
                }]
            }

            let servicesString: string = JSON.stringify(servicesResult);
            beforeEach(() => {
                jest.spyOn(fs, 'readFileSync').mockReturnValue(servicesString);
                jest.spyOn(fs, 'existsSync').mockReturnValue(true);
                serviceManager.loadConfiguration();
            });

            it('Then should set correct services on serviceManager', () => {
                expect(serviceManager.getServices()).toStrictEqual(servicesResult.services);
            });
        });
    });

    describe('And call method startService', () => {

        let mockHide = jest.fn();
        let mockSendText = jest.fn();
        beforeEach(() => {
            jest.spyOn(vscode.window, "createTerminal").mockImplementation(
                () => ({ hide: mockHide, sendText: mockSendText }) as any
            )
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
});
