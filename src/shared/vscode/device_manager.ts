import * as vscode from "vscode";
import * as f from "../chii/daemon_interfaces";
import axios from 'axios';
import SystemOut from "./system_out";

export class ChiiDeviceManager implements vscode.Disposable {

    private subscriptions: vscode.Disposable[] = [];
	// private statusBarItem: vs.StatusBarItem;
	private devices: f.Device[] = [];
	public currentDevice?: f.Device;
	private reqTimer: any;
	private systemOut: SystemOut ;

	constructor(systemOut: SystemOut){
		this.systemOut = systemOut ;
	}

    public async showDevicePicker(inputPort: string): Promise<f.Device | undefined>  {
		const quickPick = vscode.window.createQuickPick<PickableDevice>();
		quickPick.placeholder = "Select a id to use";
		quickPick.busy = true;
		quickPick.ignoreFocusOut = true;

		let quickPickIsValid = true;
		const updatePickableDeviceList = async () => {
			if (!quickPickIsValid){
                return;
			}
			this.reqTimer = setInterval(async () => {
				quickPick.items = await this.getPickableDevices(inputPort);
			  }, 2000);
		};
		// Build the initial list.
		await updatePickableDeviceList();

		const selection = await new Promise<PickableDevice>((resolve) => {
			quickPick.onDidAccept(() => resolve(quickPick.selectedItems && quickPick.selectedItems[0]));
			quickPick.onDidHide(() => resolve(undefined));
			quickPick.show();
		});
		quickPickIsValid = false;
		quickPick.dispose();

		if (selection && await this.selectDevice(selection)){
            return this.currentDevice;
        }
		return undefined;
    }
    
    public async getPickableDevices(inputPort: string): Promise<PickableDevice[]> {
		this.systemOut.log("getPickableDevices");
		const res = await axios.get(`http://localhost:${inputPort}/vscode-plugin`);
		this.systemOut.log("status="+res.status);
		this.systemOut.log("data="+res.data);
		if(res.status === 200){
            const targets = res.data.targets;
            let pickableItems: PickableDevice[] = targets
            .map((d: f.Device) => ({
		        device: d,
				isSupported: true,
				label: this.labelForDevice(d),
            }));
            return pickableItems ;
        }
		return [];
    }

    public labelForDevice(device: f.Device) {
		this.systemOut.log("deviceId="+device.id);
		return device.id;
	}
    
    public async selectDevice(selection: PickableDevice) {
		clearInterval(this.reqTimer);
        this.currentDevice = selection.device;
        //选择连接的设备，触发命令，打开调试界面
		vscode.commands.executeCommand('extension.openChiiDevTool', selection.device.id);
		return true;
	}

    dispose() {
        throw new Error("Method not implemented.");
    }

}

type PickableDevice = vscode.QuickPickItem & { device: f.Device , isSupported: boolean };