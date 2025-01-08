import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

interface ModifiedFile {
    path: string;
    status: 'modified' | 'added' | 'deleted';
}

export class ProdonikiViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'prodonikButton';
    private readonly workspaceRoot: string;
    private readonly resourcesPath: string;

    constructor(
        private readonly extensionUri: vscode.Uri,
    ) {
        this.workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
        this.resourcesPath = path.join(extensionUri.fsPath, 'resources');
    }

    private async getModifiedFiles(): Promise<ModifiedFile[]> {
        const { stdout } = await execAsync('arc status', { cwd: this.workspaceRoot });
        
        return stdout
            .split('\n')
            .filter(line => line.includes('modified:'))
            .map(line => {
                const filePath = line.split('modified:')[1].trim();
                return {
                    path: path.resolve(this.workspaceRoot, filePath),
                    status: 'modified'
                };
            });
    }

    private async formatFiles(files: ModifiedFile[], terminal: vscode.Terminal): Promise<void> {
        const formatDelay = 1000;
        
        for (const file of files) {
            if (file.status === 'modified') {
                const relativePath = path.relative(this.workspaceRoot, file.path);
                terminal.sendText(`ya tool tt format "${relativePath}"`);
                await new Promise(resolve => setTimeout(resolve, formatDelay));
            }
        }
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ): void {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getHtmlContent();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            if (data.command === 'formatAll') {
                try {
                    const modifiedFiles = await this.getModifiedFiles();

                    if (!modifiedFiles.length) {
                        vscode.window.showInformationMessage('No modified files found.');
                        return;
                    }

                    const terminal = vscode.window.createTerminal({
                        name: 'Prodonik Formatter',
                        cwd: this.workspaceRoot
                    });
                    
                    terminal.show();
                    await this.formatFiles(modifiedFiles, terminal);
                    
                    vscode.window.showInformationMessage(
                        `Formatted ${modifiedFiles.length} file${modifiedFiles.length > 1 ? 's' : ''} successfully.`
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    vscode.window.showErrorMessage(`Formatting failed: ${errorMessage}`);
                    console.error('Formatting error:', error);
                }
            }
        });
    }

    private _getHtmlContent(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File Formatter</title>
                <style>
                    body { padding: 15px; }
                    .container {
                        display: flex;
                        flex-direction: column;
                        gap: 20px;
                    }
                    .format-button {
                        padding: 8px 12px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 2px;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    .format-button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .section {
                        margin-bottom: 20px;
                    }
                    .section-title {
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        color: var(--vscode-foreground);
                    }
                    .description {
                        font-size: 12px;
                        color: var(--vscode-descriptionForeground);
                        margin-bottom: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="section">
                        <div class="section-title">File Operations</div>
                        <div class="description">Format modified files using ya tool tt format.</div>
                        <button class="format-button" id="formatAllButton">Format Files</button>
                    </div>
                    <div class="section">
                        <div class="section-title">Quick Help</div>
                        <div class="description">
                            • Click "Format Files" to format modified files<br>
                            • Uses arc status to find modified files<br>
                            • Formats each file with ya tool tt format
                        </div>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('formatAllButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'formatAll' });
                    });
                </script>
            </body>
            </html>
        `;
    }
} 