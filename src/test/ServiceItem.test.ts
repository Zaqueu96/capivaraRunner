import * as vscode from 'vscode';
import { ServiceConfig } from '../main/ServiceManager';
import { ServiceTreeDataProvider } from '../main/ServiceTree';
import { Logger } from '../main/Logger';
import { ServiceItem } from '../main/ServiceItem';
import { EXTENSION_START_SERVICE, EXTENSION_STOP_SERVICE } from '../main/Constants'


describe('ServiceItem Tests', () => {
    const services: ServiceConfig =
    {
        command: "npm run mock",
        dependsOn: ["docker"],
        name: 'service_name_mock',
        workingDirectory: './service_mock'
    };

    let serviceTreeDataProvider: ServiceTreeDataProvider;
    let logger: Logger;
    const service: ServiceConfig = {
        command: "npm run mock",
        dependsOn: ["dependMock"],
        name: "mockService",
        workingDirectory: "./mockDir"
    };
    let spyOnIsRunning: jest.SpyInstance<boolean, [service: ServiceConfig], any>;
    let spyOnGetServices: jest.SpyInstance<ServiceConfig[], [], any>;

    beforeEach(() => {

        // serviceTreeDataProvider = new ServiceTreeDataProvider(serviceManager);
    });

    describe('And create instance', () => {

        describe('And with isRunning False ', () => {
            let instanceServiceItem: ServiceItem;
            beforeEach(async () => {
                instanceServiceItem = new ServiceItem(service, false);
            });

            it('Then should call vscode.ThemeIcon with \'play\'', () => {
                expect(vscode.ThemeIcon).toHaveBeenCalledWith('play');
            });

            it('Then should instance command is correct', () => {
                expect(instanceServiceItem?.command).toStrictEqual({
                    title: 'Start Service',
                    command: EXTENSION_START_SERVICE,
                    arguments: [service]
                });
            });
        });

        describe('And with isRunning True ', () => {
            let instanceServiceItem: ServiceItem;
            beforeEach(async () => {
                instanceServiceItem = new ServiceItem(service, true);
            });

            it('Then should call vscode.ThemeIcon with \'debug-stop\'', () => {
                expect(vscode.ThemeIcon).toHaveBeenCalledWith('debug-stop');
            });

            it('Then should instance command is correct', () => {
                expect(instanceServiceItem?.command).toStrictEqual({
                    title: 'Stop Service',
                    command: EXTENSION_STOP_SERVICE,
                    arguments: [service]
                });
            });
        });
    });
});
