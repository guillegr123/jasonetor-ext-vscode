'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    let previewUri = vscode.Uri.parse('css-preview://authority/css-preview');
    class TextDocumentContentProvider {
        constructor() {
            this._onDidChange = new vscode.EventEmitter();
        }
        provideTextDocumentContent(uri) {
            let editor = vscode.window.activeTextEditor;
            if (!(editor.document.languageId === 'json')) {
                return this.buildSimpleSnippet("Active editor doesn't show a JSON document - no JSON to edit.");
            }
            return this.buildRendererSnippet();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        update(uri) {
            this._onDidChange.fire(uri);
        }
        buildRendererSnippet() {
            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText();
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
								deselect(selectedId) {
									if (this.id !== selectedId) {
										this.selected = false;
										eventBus.$off(this.deselect);
									}
								},
								toggleSelected() {
									if (!this.selected) {
										this.selected = true;
										eventBus.$emit('node.onSelected', this.id);
										eventBus.$on('node.onSelected', this.deselect);
									} else {
										this.deselect('');
									}
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
        buildSimpleSnippet(text) {
            return `<body>${text}</body>`;
        }
    }
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('css-preview', provider);
    vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(previewUri);
        }
    });
    let disposable = vscode.commands.registerCommand('extension.jsonSideEditor', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'JSON Editor').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });
    context.subscriptions.push(disposable, registration);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map