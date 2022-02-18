
const command = require('./command')

function activate(context) {
    console.log('Congratulations, your extension "vsc-google-translate" is now active!');

    command.initSetting(context);

    context.subscriptions.push(command.hoverDisposable);
}

exports.activate = activate;


function deactivate() {
}

exports.deactivate = deactivate;