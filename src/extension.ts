import * as vscode from 'vscode';
import { ChiiDeviceManager } from './shared/vscode/device_manager';
import PortInputBox from './shared/vscode/port_inputbox';
import ChiiServer from './shared/chii/chii_server';
import SystemOut from './shared/vscode/system_out';
const internalIp = require('internal-ip');
let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	const systemOut = new SystemOut();
	systemOut.init();
	/**
	 * 设置statusBar，并关联command，command触发事件，选择连接的设备
	 */
	let chiiCommandId = 'extension.chii' ;
	let startChiiServerCommandId = 'extension.startChiiServer' ;
	let showDevicePickerCommandId = 'extension.showDevicePicker' ;
	let openDevToolCommand = 'extension.openChiiDevTool' ;
	let inputPort = '6630';
	let addr = internalIp.v4.sync();
	const deviceManager = new ChiiDeviceManager(systemOut);
	const portInput = new PortInputBox();
	const chiiServer = new ChiiServer();
	context.subscriptions.push(vscode.commands.registerCommand(chiiCommandId, portInput.showPortInputBox));

	context.subscriptions.push(vscode.commands.registerCommand(startChiiServerCommandId, (port) =>{
		inputPort = port ;
		chiiServer.start(port);
		vscode.window.showInformationMessage(`Add <script src="http://${addr}:${inputPort}/target.js"></script> in your html file!`);
	}));
	context.subscriptions.push(vscode.commands.registerCommand(showDevicePickerCommandId, () => {
		deviceManager.showDevicePicker(addr, inputPort);
	}, deviceManager));
	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100);
	myStatusBarItem.command = chiiCommandId;
	let themeColor = 'debug-alt' ;
	// myStatusBarItem.color = themeColor ;
	myStatusBarItem.text = `$(${themeColor}) 启动调试(chii-dev-tool)`;
	myStatusBarItem.tooltip = `启动调试真机界面`;
	myStatusBarItem.show();
	context.subscriptions.push(myStatusBarItem);
	/**
	 * 注册命令，打开调试界面
	 */
	let openDevToolSubscriptions = vscode.commands.registerCommand(openDevToolCommand, (targetId) =>{
		const panel = vscode.window.createWebviewPanel(
			'chii-dev-tool',
			'DevTool',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);
		panel.webview.html = getWebviewContent(targetId, inputPort) ;
	});
	context.subscriptions.push(openDevToolSubscriptions);
}

function getWebviewContent(targetId: string, inputPort: string) {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
	  <style>
	  	iframe {
			border-top-width: 0px;
			border-right-width: 0px;
			border-bottom-width: 0px;
			border-left-width: 0px;
			color: var(--vscode-editor-foreground);
			font-family: var(--vscode-editor-font-family);
			font-weight: var(--vscode-editor-font-weight);
			font-size: var(--vscode-editor-font-size);
		}
	  </style>
  </head>
  <body>
  	<iframe src ="http://localhost:${inputPort}/front_end/chii_app.html?ws=localhost:${inputPort}/client/D0OOli?target=${targetId}" width="100%" height="800px"></iframe>
  </body>
  </html>`;
  }

export function deactivate() {}
