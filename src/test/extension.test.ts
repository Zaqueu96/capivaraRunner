import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('CapivaraRunner Extension Test Suite', () => {

    let createOutputChannelStub: sinon.SinonStub;
    let showInformationMessageSinon: sinon.SinonStub;    
    let showErrorMessageSinon: sinon.SinonStub;

    vscode.window.showInformationMessage('Start all tests.');

    suiteSetup(async () => {
        await vscode.extensions.getExtension('capivararunner')?.activate();
    });

    setup(() => {
        showInformationMessageSinon = sinon.stub(vscode.window, 'showInformationMessage');
        showErrorMessageSinon = sinon.stub(vscode.window, 'showErrorMessage');
    });

    teardown(() => {
        sinon.restore();
    });

    suite('And validation load configuration', () => {

        test('Then should not load configuration when capivara.config.json does not exist', async () => {			
            await vscode.commands.executeCommand('extension.refresh');
            assert.equal(showErrorMessageSinon.args[0][0],'Config file (capivara.config.json) not found');
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

			assert.equal(showInformationMessageSinon.args[0][0],'Reloaded configuration!');
     
            fs.unlinkSync(configPath);
        });

    });

    suite('And validate commands are registered', () => {
		let commanndsListRegistered:string[] = []; 

		setup(async () =>{
			commanndsListRegistered = await vscode.commands.getCommands(true);
		});

        test('Then should command \'startAllServices\' should be registered',  () => {
            assert.ok(
                commanndsListRegistered.includes('extension.startAllServices'),
                'Command startAllServices was not registered.'
            );
        });

		test('Then should command \'stopAllServices\' should be registered', () => {
            assert.ok(
                commanndsListRegistered.includes('extension.stopAllServices'),
                'Command stopAllServices was not registered.'
            );
        });

		test('Then should command \'stopService\' should be registered', () => {
            assert.ok(
                commanndsListRegistered.includes('extension.stopService'),
                'Command stopService was not registered.'
            );
        });

		test('Then should command \'startService\' should be registered', () => {
            assert.ok(
                commanndsListRegistered.includes('extension.startService'),
                'Command startService was not registered.'
            );
        });

		test('Then should command \'refresh\' should be registered', () => {
            assert.ok(
                commanndsListRegistered.includes('extension.refresh'),
                'Command refresh was not registered.'
            );
        });

    });
});
