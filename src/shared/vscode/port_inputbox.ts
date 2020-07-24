import * as vscode from "vscode";

export default class PortInputBox {

    public async showPortInputBox(): Promise<boolean | undefined>{
        let opt:vscode.InputBoxOptions = {
            ignoreFocusOut: true,
            prompt: '请输入端口号,默认6630',
            value: '6630',
        };
        const inputStr = await vscode.window.showInputBox(opt);
        //选择连接的设备，触发命令，打开调试界面
        console.log("input port="+ inputStr);
        vscode.commands.executeCommand('extension.startChiiServer', inputStr);
        return true;
    }


}