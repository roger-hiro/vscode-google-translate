const vscode = require('vscode');
const translator = require('@imlinhanchao/google-translate-api');

let config = {};


async function translate(text, lang) {
    try{
        let result = await translator(text, {
            from: lang.from == 'auto' ? undefined : lang.from,
            to: lang.to,
        })

        return {
            lang,
            text,
            word: result.text || '',
            candidate: result.candidates
        };
    } catch (err) {
        throw new Error(`Translate failed, Error message: '${err.message}'. Please post an issues for me.`);
    }      
}

function getConfig() {
    let keys = [
        'google-translate.firstLanguage',
        'google-translate.secondLanguage',
    ];
    let values = {};
    keys.forEach(k => values[k] = vscode.workspace.getConfiguration().get(k))
    return values;
}

module.exports = async (word, l, from='auto') => {
    if (word == '') return null;
    config = getConfig();
    let lang = {
        from,
        to: l || config['google-translate.firstLanguage']
    };
    console.log('驼峰之前：', word);
    word = word.replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/([_])/g, " ").replace(/=/g, ' = ')
            .replace(/(\b)\.(\b)/g, '$1 \n{>}\n $2 ');
    console.log('驼峰之后：', word);
    let tran = await translate(word, lang);
    if (tran.word.replace(/\s/g, '') == word.replace(/\s/g, '') || !tran.word.trim()) {
        lang.to = config['google-translate.secondLanguage'];
        let tranSecond = await translate(word, lang);
        if (tranSecond.word) tran = tranSecond;
    }

    tran.word = tran.word.replace(/\n{>}\n/g, '.');
    tran.candidate = tran.candidate.map(c => c.replace(/{([^>]*?)>}/g, '$1\n{>}').replace(/\n{>}\n/g, '.'));
    return tran;
};

module.exports.getConfig = getConfig;
module.exports.languages = translator.languages;