import * as vscode from 'vscode';

export default class SystemOut {

    private channel:any ;

    public init(){
        this.channel = vscode.window.createOutputChannel('Chii-Dev-Tool');
        this.channel.appendLine(`Chii-Dev-Tool start！`);
    }

    public log(str: any) {
        this.channel.appendLine(str);
    }
    
}