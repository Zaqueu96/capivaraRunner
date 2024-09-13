import * as vscode from 'vscode';
import { activate } from '../main/CapivaraRunnerExtension';
import { ServiceManager } from '../main/ServiceManager';
import { EXTENSION_REFRESH, EXTENSION_START_ALL_SERVICES, EXTENSION_START_SERVICE, EXTENSION_STOP_ALL_SERVICES, EXTENSION_STOP_SERVICE } from '../main/Constants';
jest.mock('../main/ServiceManager');
const ServiceManagerMock = ServiceManager as jest.MockedClass<typeof ServiceManager>;

describe('CapivaraRunnerExtension Tests', () => {
    let context: vscode.ExtensionContext;
    let serviceManagerMock: any;

    beforeEach(() => {
        context = {
            subscriptions: [],
        } as any;

        jest.clearAllMocks();
    });

    describe('And call method activate', () => {
        let spyOnLoadConfiguration: any;
        serviceManagerMock = new ServiceManager() as jest.Mocked<ServiceManager>;
        serviceManagerMock.loadConfiguration = jest.fn();
        serviceManagerMock.startService = jest.fn();
        serviceManagerMock.stopService = jest.fn();
        serviceManagerMock.startAllServices = jest.fn();
        serviceManagerMock.stopAllServices = jest.fn();

        beforeEach(() => {
            spyOnLoadConfiguration = jest.spyOn(serviceManagerMock, 'loadConfiguration');

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

        describe('And validate command execution', () => {
            let registeredCommands: any;

            beforeAll(() => {
                registeredCommands = (vscode.commands.registerCommand as jest.Mock).mock.calls;
            });

            it('Then should call "startService" when the "startService" command is executed', () => {
                registeredCommands[0][1]();
                expect(serviceManagerMock.startService).toHaveBeenCalled();
            });

            it('Then should call "stopService" when the "stopService" command is executed', () => {
                registeredCommands[1][1]();
                expect(serviceManagerMock.stopService).toHaveBeenCalled();
            });

            it('Then should call "startAllServices" when the "startAllServices" command is executed', () => {
                registeredCommands[2][1]();
                expect(serviceManagerMock.startAllServices).toHaveBeenCalled();
            });

            it('Then should call "stopAllServices" when the "stopAllServices" command is executed', () => {
                registeredCommands[3][1]();
                expect(serviceManagerMock.stopAllServices).toHaveBeenCalled();
            });

            it('Then should reload the configuration when the "refresh" command is executed', () => {
                registeredCommands[4][1]();
                expect(serviceManagerMock.loadConfiguration).toHaveBeenCalled();
                expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Reloaded configuration!');
            });
        });
    });
});
