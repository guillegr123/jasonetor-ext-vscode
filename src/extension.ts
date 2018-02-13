'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let previewUri = vscode.Uri.parse('css-preview://authority/css-preview');

	class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
		private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

		public provideTextDocumentContent(uri: vscode.Uri): string {
			return this.createCssSnippet();
		}

		get onDidChange(): vscode.Event<vscode.Uri> {
			return this._onDidChange.event;
		}

		public update(uri: vscode.Uri) {
			this._onDidChange.fire(uri);
		}

		private createCssSnippet() {
			let editor = vscode.window.activeTextEditor;
			if (!(editor.document.languageId === 'json')) {
				return this.snippet("Active editor doesn't show a JSON document - no JSON to edit.")
			}
			return this.extractSnippet();
		}

		private extractSnippet(): string {
			let editor = vscode.window.activeTextEditor;
			let text = editor.document.getText();
			let selStart = editor.document.offsetAt(editor.selection.anchor);
			let propStart = text.lastIndexOf('{', selStart);
			let propEnd = text.indexOf('}', selStart);

			if (propStart === -1 || propEnd === -1) {
				return this.snippet("Cannot determine the rule's properties.");
			} else {
				return this.snippet(text);
			}
		}

		private snippet(text: string): string {
			return `
                <body>
                    <pre>
                        ${text}
                    </pre>
				</body>`;
		}
	}

	let provider = new TextDocumentContentProvider();
	let registration = vscode.workspace.registerTextDocumentContentProvider('css-preview', provider);

	vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
		if (e.textEditor === vscode.window.activeTextEditor) {
			provider.update(previewUri);
		}
	})

	let disposable = vscode.commands.registerCommand('extension.jsonSideEditor', () => {
		return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'JSON Editor').then((success) => {
		}, (reason) => {
			vscode.window.showErrorMessage(reason);
		});
	});

	context.subscriptions.push(disposable, registration);
}
