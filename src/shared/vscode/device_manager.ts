import * as vscode from "vscode";
import * as f from "../chii/daemon_interfaces";
import axios, { AxiosInstance } from 'axios';

export class ChiiDeviceManager implements vscode.Disposable {

    private subscriptions: vscode.Disposable[] = [];
	// private statusBarItem: vs.StatusBarItem;
	private devices: f.Device[] = [];
	public currentDevice?: f.Device;
	private instance!: AxiosInstance;
	private reqTimer: any;

    public async showDevicePicker(inputPort: string): Promise<f.Device | undefined>  {
		this.instance = axios.create({
            baseURL: `http://localhost:${inputPort}`
        });
		const quickPick = vscode.window.createQuickPick<PickableDevice>();
		quickPick.placeholder = "Select a device to use";
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
		// const sortedDevices = this.devices.sort(this.deviceSortComparer.bind(this));
        // Set config defaults when creating the instance
        const res = await this.instance.get('/vscode-plugin');
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
		return device.id;
	}
    
    public async selectDevice(selection: PickableDevice) {
        this.currentDevice = selection.device;
        //选择连接的设备，触发命令，打开调试界面
		vscode.commands.executeCommand('extension.openChiiDevTool', selection.device.id);
		clearInterval(this.reqTimer);
		return true;
	}

    dispose() {
        throw new Error("Method not implemented.");
    }

}

type PickableDevice = vscode.QuickPickItem & { device: f.Device , isSupported: boolean };