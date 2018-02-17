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
					<link rel="stylesheet" type="text/css" href="https://opensource.keycdn.com/fontawesome/4.7.0/font-awesome.min.css">
					<div id="app">
						<tree-menu :props="Object.keys(tree)" :jobject="tree" :depth="0" :label="'Root'"></tree-menu>
					</div>
					<style>
						.tree-menu.selected { background-color: yellow; color: black }
					</style>
					<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.0.0/vue.js">
					</script>
					<script type="text/x-template" id="tree-menu">
						<div class="tree-menu" :class="selectedClasses">
							<div class="label-wrapper">
								<div :style="indent" :class="labelClasses">
									<i v-if="hasChildren" class="fa" :class="iconClasses" @click="toggleChildren"></i>
									<b @click="toggleSelected">{{ label }}:</b>
		  							<span v-if="!hasChildren" >{{ jobject }}</span>
								</div>
							</div>
							<tree-menu v-if="hasChildren && showChildren" v-for="prop in props" :props="Object.keys(jobject[prop])" :jobject="jobject[prop]" :label="prop" :depth="depth + 2">
							</tree-menu>
						</div>
					</script>
					<script>
						let tree = ${text};
				
						function uuidv4() {
							return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
							  	var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
							  	return v.toString(16);
							});
						};

						var eventBus = new Vue();

						Vue.component('tree-menu', { 
							template: '#tree-menu',
							props: [ 'props', 'jobject', 'label', 'depth' ],
							created () {
								eventBus.$on('node.onSelected', (selectedId) => {
									if (this.id !== selectedId) {
										this.selected = false;
									}
								});
							},
							data() {
								return {
									id: uuidv4(),
									showChildren: true,
									hasChildren: typeof(this.jobject) == 'object' || typeof(this.jobject) == 'Array',
									selected: false,
									indent: { 'padding-left': \`\${this.depth}em\` }
								}
							},
							computed: {
								iconClasses() {
									return {
										'fa-plus-square-o': !this.showChildren,
										'fa-minus-square-o': this.showChildren
									}
								},
								labelClasses() {
									return { 'has-children': this.hasChildren }
								},
								selectedClasses() {
									return { 'selected': this.selected }
								}
							},
							methods: {
								toggleChildren() {
									this.showChildren = !this.showChildren;
								},
								toggleSelected() {
									this.selected = !this.selected;
									eventBus.$emit('node.onSelected', this.id);
								}
							}
						});
				
						new Vue({
							el: '#app',
							data: {
								tree
							}
						});
					</script>
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
