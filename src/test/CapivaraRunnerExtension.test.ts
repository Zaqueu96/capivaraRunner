import * as vscode from 'vscode';
import { activate } from '../main/CapivaraRunnerExtension';
import { ServiceManager } from '../main/ServiceManager';
import { EXTENSION_REFRESH, EXTENSION_START_ALL_SERVICES, EXTENSION_START_SERVICE, EXTENSION_STOP_ALL_SERVICES, EXTENSION_STOP_SERVICE } from '../main/Constants';
jest.mock('../main/ServiceManager');
const ServiceManagerMock = ServiceManager as jest.MockedClass<typeof ServiceManager>;

describe('CapivaraRunnerExtension Tests', () => {
    let context: vscode.ExtensionContext;

    beforeEach(() => {
        context = {
            subscriptions: [],
        } as any;

        jest.clearAllMocks();
    });

    describe('And call method activate', () => {
        let spyOnLoadConfiguration: any;
        const serviceManagerMock = new ServiceManagerMock();

        beforeEach(() => {            
            spyOnLoadConfiguration =  jest.spyOn(serviceManagerMock, 'loadConfiguration');

            (ServiceManager as jest.MockedClass<typeof ServiceManager>).mockImplementation(() => serviceManagerMock);

            activate(context);
        });

        it('Then should load the configuration on activation', () => {
            expect(spyOnLoadConfiguration).toHaveBeenCalled();
        });

        it('Then should register the "startService" command', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                EXTENSION_START_SERVICE,
                expect.any(Function)
            );
        });

        it('Then should register the "stopService" command', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                EXTENSION_STOP_SERVICE,
                expect.any(Function)
            );
        });

        it('Then should register the "startAllServices" command', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                EXTENSION_START_ALL_SERVICES,
                expect.any(Function)
            );
        });

        it('Then should register the "stopAllServices" command', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                EXTENSION_STOP_ALL_SERVICES,
                expect.any(Function)
            );
        });

        it('Then should register the "refresh" command', () => {
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                EXTENSION_REFRESH,
                expect.any(Function)
            );
        });

    });
});
