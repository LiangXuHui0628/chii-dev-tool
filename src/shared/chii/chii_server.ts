import * as vscode from "vscode";
const server = require('chii-vscode-plugin/server');

export default class ChiiServer {

    public async start(port:string) {
        const host = '0.0.0.0';
        const domain = '';
        const prop = {port, host, domain};
        await server.start(prop);
        console.log('server is start on '+port);
        vscode.commands.executeCommand('extension.showDevicePicker');
    }
}
