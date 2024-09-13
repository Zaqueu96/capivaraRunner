
module.exports = {
    
    ThemeIcon: jest.fn(),
    TreeItem: jest.fn(),
    TreeItemCollapsibleState: {
        None: "None"
    },
    OutputChannel: jest.fn(),
    window: {
        registerTreeDataProvider: jest.fn(),
        createTerminal: jest.fn().mockReturnValue({
            sendText: jest.fn(),
            hide: jest.fn()
        }),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            show: jest.fn(),
        }),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
    },
    workspace: {
        rootPath: "/path/to/config/",
    },
    commands: {
        registerCommand: jest.fn(),
    },


};
