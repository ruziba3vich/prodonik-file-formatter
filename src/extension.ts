import * as vscode from 'vscode';
import { ProdonikiViewProvider } from './prodonikViewProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating Prodonik File Formatter extension...');
    
    try {
        // Register view provider
        const provider = new ProdonikiViewProvider(context.extensionUri);
        
        // Make sure this registration happens first
        const viewRegistration = vscode.window.registerWebviewViewProvider(
            'prodonikButton',
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        );

        context.subscriptions.push(viewRegistration);

        // Format file command
        const formatFileCommand = vscode.commands.registerCommand('prodonik-file-formatter.formatFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                try {
                    const document = editor.document;
                    await vscode.commands.executeCommand('editor.action.formatDocument');
                    vscode.window.showInformationMessage(`Successfully formatted ${document.fileName}`);
                } catch (error) {
                    console.error('Error formatting file:', error);
                    vscode.window.showErrorMessage(`Error formatting file: ${error}`);
                }
            } else {
                vscode.window.showWarningMessage('No active text editor found.');
            }
        });

        context.subscriptions.push(formatFileCommand);
        console.log('Prodonik File Formatter extension activated successfully.');
    } catch (error) {
        console.error('Error activating extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Prodonik File Formatter: ${error}`);
    }
}

export function deactivate() {
    console.log('Deactivating Prodonik File Formatter extension...');
}
