const vscode = require('vscode');
const translate = require('./tranlate');

let langFrom;
let hoverOpen = false;
let langTo = undefined;

function initSetting(cxt) {
    hoverOpen = cxt.globalState.get('hover') || false;
    langFrom = cxt.globalState.get('fromLang') || 'auto'
    if (!translate.languages.isSupported(langFrom)) langFrom = 'auto';
    cxt.globalState.update('hover', hoverOpen);
}

let hoverDisposable = vscode.languages.registerHoverProvider({scheme: 'file'}, {
    provideHover: async (document, position, token) => {
        let editor = vscode.window.activeTextEditor;
        if (!editor || !hoverOpen) {
            return; // No open text editor
        }

        let length = editor.selections.length;
        for (let i = 0; i < length; i++) {
            let selection = editor.selections[i];
            let line = { 
                begin: Math.min(selection.anchor.line, selection.active.line),
                end: Math.max(selection.anchor.line, selection.active.line)
            }, character = {
                begin: Math.min(selection.anchor.character, selection.active.character),
                end: Math.max(selection.anchor.character, selection.active.character)
            };
            if (line.begin > position.line || character.begin > position.character) continue;
            if (line.end < position.line || character.end < position.character) continue;
            try {
                let trans = await translate(editor.document.getText(selection), langTo);
                if (!trans) return;
                let word = trans.word    
                let pre = `**[Google Translate](https://translate.google.cn/?sl=auto&tl=${trans.lang.to}&text=${encodeURI(trans.text)})**\n\n`;
                return new vscode.Hover(pre + word.replace(/\r\n/g, '  \r\n'));
            } catch (error) {
                return new vscode.Hover('**[Error](https://github.com/imlinhanchao/vsc-google-translate/issues)**\n\n' + error.message);
            }
        }

    }
})

module.exports = {
    initSetting,
    hoverDisposable,
}