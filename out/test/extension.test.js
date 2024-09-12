"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const sinon = __importStar(require("sinon"));
suite('CapivaraRunner Extension Test Suite', () => {
    let createOutputChannelStub;
    let showInformationMessageSinon;
    let showErrorMessageSinon;
    vscode.window.showInformationMessage('Start all tests.');
    suiteSetup(async () => {
        await vscode.extensions.getExtension('capivararunner')?.activate();
    });
    setup(() => {
        showInformationMessageSinon = sinon.stub(vscode.window, 'showInformationMessage');
        showErrorMessageSinon = sinon.stub(vscode.window, 'showErrorMessage');
        //createOutputChannelStub = sinon.stub(vscode.window, 'createOutputChannel');
    });
    teardown(() => {
        sinon.restore();
    });
    suite('And validation load configuration', () => {
        test('Then should not load configuration when capivara.config.json does not exist', async () => {
            await vscode.commands.executeCommand('extension.refresh');
            assert.equal(showErrorMessageSinon.args[0][0], 'Config file (capivara.config.json) not found');
        });
        test('Then should load configuration when capivara.config.json exists', async () => {
            const configPath = path.join(vscode.workspace.rootPath || '', 'capivara.config.json');
            // Cria o arquivo de configuração
            fs.writeFileSync(configPath, JSON.stringify({
                services: [
                    {
                        name: "Service1",
                        workingDirectory: ".",
                        command: "npm start",
                        dependsOn: []
                    }
                ]
            }));
            await vscode.commands.executeCommand('extension.refresh');
            assert.equal(showInformationMessageSinon.args[0][0], 'Reloaded configuration!');
            fs.unlinkSync(configPath);
        });
    });
    suite('And validate commands are registered', () => {
        let commanndsListRegistered = [];
        setup(async () => {
            commanndsListRegistered = await vscode.commands.getCommands(true);
        });
        test('Then should command \'startAllServices\' should be registered', () => {
            assert.ok(commanndsListRegistered.includes('extension.startAllServices'), 'Command startAllServices was not registered.');
        });
        test('Then should command \'stopAllServices\' should be registered', () => {
            assert.ok(commanndsListRegistered.includes('extension.stopAllServices'), 'Command stopAllServices was not registered.');
        });
        test('Then should command \'stopService\' should be registered', () => {
            assert.ok(commanndsListRegistered.includes('extension.stopService'), 'Command stopService was not registered.');
        });
        test('Then should command \'startService\' should be registered', () => {
            assert.ok(commanndsListRegistered.includes('extension.startService'), 'Command startService was not registered.');
        });
        test('Then should command \'refresh\' should be registered', () => {
            assert.ok(commanndsListRegistered.includes('extension.refresh'), 'Command refresh was not registered.');
        });
    });
});
//# sourceMappingURL=extension.test.js.map