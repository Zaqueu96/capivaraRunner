import * as vscode from 'vscode';
import { ServiceConfig, ServiceManager } from '../main/ServiceManager';
import { ServiceTreeDataProvider } from '../main/ServiceTree';
import { Logger } from '../main/Logger';
import { ServiceItem } from '../main/ServiceItem';


describe('ServiceTreeDataProvider Tests', () => {
    const serviceManager: ServiceManager = new ServiceManager();
    const services: ServiceConfig[] = [
        {
            command: "npm run mock",
            dependsOn: ["docker"],
            name: 'service_name_mock',
            workingDirectory: './service_mock'
        }
    ];

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
        spyOnIsRunning = jest.spyOn(serviceManager, 'isRunning')
            .mockImplementation(() => false);
        spyOnGetServices = jest.spyOn(serviceManager, 'getServices')
            .mockImplementation(() => services);


        serviceTreeDataProvider = new ServiceTreeDataProvider(serviceManager);
    });

    describe('And call getChildren ', () => {

        describe('And get without element ', () => {
            let resultTree: ServiceItem[];
            beforeEach(async () => {
                resultTree = await serviceTreeDataProvider.getChildren();
            });

            it('Then should call method serviceManager.getServices()', () => {
                expect(spyOnGetServices).toHaveBeenCalled();
            });

            it('Then should call method serviceManager.isRunning with correct service', () => {
                expect(spyOnIsRunning).toHaveBeenCalledWith(services[0]);
            });

            it('Then should result correct children', () => {
                expect(resultTree[0])
                    .toStrictEqual(new ServiceItem(services[0], false));
            });
        });

        describe('And get with element', () => {
            let resultTree: ServiceItem[];
            beforeEach(async () => {
                spyOnGetServices.mockClear();
                resultTree = await serviceTreeDataProvider.getChildren(true as any);
            });

            it('Then should not call method serviceManager.getServices()', () => {
                expect(spyOnGetServices).not.toHaveBeenCalled();
            });

            it('Then should returns empty array', () => {
                expect(resultTree).toStrictEqual([]);
            });
        });
    });

    describe('And call getTreeItem', () => {
        const expectedServiceItem: ServiceItem = new ServiceItem(services[0], false);
        let resultTreeItem: vscode.TreeItem;
        beforeEach(() => {
            resultTreeItem = serviceTreeDataProvider.getTreeItem(expectedServiceItem);
        });

        it('Then should returns correct treeItem ', () => {
            expect(resultTreeItem).toStrictEqual(expectedServiceItem);
        });
    });
});
