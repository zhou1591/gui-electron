const { app, BrowserWindow, dialog, ipcMain, globalShortcut, screen } = require('electron');
const child = require('child_process');
const { autoUpdater } = require('electron-updater')
const http = require('http')

const path = require('path');
const os = require('os');
const fs = require('fs');
const { getFilterForExtension } = require('./FileFilters');
const beforeClose = require('./src/beforeClose');
const { bluetoothModeEnum } = require('./enum');

let callbackForBluetoothEvent = null;

app.commandLine.appendSwitch('--ignore-certificate-errors', 'true');

// 蓝牙扫描回调
let bluetoothScanfCallback = null
// 蓝牙连接模式逻辑
let bluetoothMode = ''
if (isWin7()) {
    // 解决win7有些系统白屏的问题
    app.disableHardwareAcceleration();
}

const realSize = {
    width: 1194,
    height: 834,
};
let mainWindow = null
const minWidth = parseInt(realSize.width * 0.95)
const minHeight = parseInt(realSize.height * 0.95)
// 存储所有事件回调
const allCallback = {}
// 存储全局变量
const allGlobalState = {}
function createWindow() {

    mainWindow = new BrowserWindow({
        // width: 1440,
        // height: 800,
        show: false,
        width: realSize.width,
        height: realSize.height,
        title: 'Gewucode v0.1',
        icon: path.join(__dirname, './www/static/favicon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    mainWindow.maximize()
    mainWindow.setMinimumSize(minWidth, minHeight);
    mainWindow.show()
    // 纵向拉伸
    // const newBounds =  screen.getPrimaryDisplay().workAreaSize
    // const initWidth = parseInt(
    //     (realSize.width / realSize.height) * ((newBounds.height-30)*0.95) 
    // )
    // const initHeight = parseInt((newBounds.height-30)*0.95) 
    // mainWindow.setContentSize(initWidth,initHeight); //注意此项设置的是ContentSize，此项大小不包括标题栏。

    mainWindow.setMenu(null);
    globalShortcut.register('CommandOrControl+Shift+z', () => {
        mainWindow.webContents.openDevTools()
    })
    // 下载hb文件
    globalShortcut.register('CommandOrControl+Shift+s', () => {
        mainWindow.webContents.send('saveToComputer')
    })
    // 上传文件
    globalShortcut.register('CommandOrControl+Shift+u', () => {
        mainWindow.webContents.send('uploadFile')
    })
    ipcMain.on('channelForDown', (event, url) => {
        mainWindow.webContents.downloadURL(url)
    });
    mainWindow.webContents.on(
        'select-bluetooth-device',
        (event, deviceList, callback) => {
            event.preventDefault();
            console.log(deviceList);

            // L6 蓝牙逻辑
            const L6bluetooth = () => {
                bluetoothScanfCallback = callback
                if (deviceList[0].deviceId) {
                    mainWindow.webContents.send(
                        'setBluetoothMac',
                        deviceList[0].deviceId
                    );
                    bluetoothScanfCallback = null
                    // 产品坚持不会有多个设备 只要第一个扫描到的符合厂商id 的蓝牙设备
                    callback(deviceList[0].deviceId);
                }
            }
            const config = {
                [bluetoothModeEnum.L6]: L6bluetooth
            }
            const activeConfig = config[bluetoothMode]
            if (activeConfig) {
                activeConfig()
                bluetoothMode = null
                return
            }

            // 没有指定逻辑则执行之前的逻辑
            callbackForBluetoothEvent = callback;
            mainWindow.webContents.send(
                'channelForBluetoothDeviceList',
                deviceList
            );
        }
    );

    mainWindow.webContents.session.on(
        'select-serial-port',
        (event, portList, webContents, callback) => {
            console.log(portList)
            event.preventDefault();
            // 设备批次号和商品号
            const gewubanVendorId = '6790';
            const gewubanProductId = '29987';
            // 有且只有一个符合的直接连接
            const filterPort = portList.filter(el => el.vendorId === gewubanVendorId && el.productId === gewubanProductId)
            // 只有一个直接返回
            if (filterPort.length === 1) {
                return callback(filterPort[0].portId);
            }
            allCallback.selectSerialPortCallback = callback
            // 通知客户端接受本次串口列表
            mainWindow.webContents.send(
                'setLastScanfUsbList',
                portList
            );
        }
    );

    mainWindow.webContents.session.on('serial-port-added', (event, port) => {
        console.log('serial-port-added FIRED WITH', port);
    });

    mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
        console.log('serial-port-removed FIRED WITH', port);
    });

    // let mainUrl = `file://${path.join(__dirname, './www/index.html')}`;
    let mainUrl = `file://${path.join(__dirname, './www/l6Course.html')}`; //xxx
    // mainUrl = `file://${path.join(__dirname, './index.html')}`;

    // let mainUrl = 'http://localhost:9003/l6Course.html';

    mainWindow.loadURL(mainUrl);
    // mainWindow.setMenu(null);

    const getIsProjectSave = (downloadItem) => {
        switch (downloadItem.getMimeType()) {
            case 'application/x.gewucode.hb':
                return true;
        }
        return false;
    };

    mainWindow.webContents.session.on(
        'will-download',
        (willDownloadEvent, downloadItem) => {
            const isProjectSave = getIsProjectSave(downloadItem);
            const itemPath = downloadItem.getFilename();
            const baseName = path.basename(itemPath);
            const extName = path.extname(baseName);
            const options = {
                defaultPath: baseName,
            };
            if (extName) {
                const extNameNoDot = extName.replace(/^\./, '');
                options.filters = [getFilterForExtension(extNameNoDot)];
            }
            const userChosenPath = dialog.showSaveDialogSync(
                mainWindow,
                options
            );
            // this will be falsy if the user canceled the save
            if (userChosenPath) {
                const userBaseName = path.basename(userChosenPath);
                // const tempPath = path.join(app.getPath('temp'), userBaseName);

                // WARNING: `setSavePath` on this item is only valid during the `will-download` event. Calling the async
                // version of `showSaveDialog` means the event will finish before we get here, so `setSavePath` will be
                // ignored. For that reason we need to call `showSaveDialogSync` above.
                // console.log(userChosenPath)
                downloadItem.setSavePath(userChosenPath);

                downloadItem.on('done', async (doneEvent, doneState) => {
                    try {
                        if (doneState !== 'completed') {
                            // The download was canceled or interrupted. Cancel the telemetry event and delete the file.
                            throw new Error(`save ${doneState}`); // "save cancelled" or "save interrupted"
                        }
                        // fs.renameSync(tempPath, userChosenPath);
                        if (isProjectSave) {
                            const newProjectTitle = path.basename(
                                userChosenPath,
                                extName
                            );
                            mainWindow.webContents.send('setTitleFromSave', {
                                title: newProjectTitle,
                            });
                        }
                    } catch (e) {
                        // don't clean up until after the message box to allow troubleshooting / recovery
                        await dialog.showMessageBox(mainWindow, {
                            type: 'error',
                            title: '保存文件失败',
                            message: `Save failed:\n${userChosenPath}`,
                            detail: e.message,
                        });
                    }
                });
            } else {
                downloadItem.cancel();
            }
        }
    );

    mainWindow.webContents.on('will-prevent-unload', (ev) => {
        beforeClose(ev, mainWindow, {
            notCloseWin: allGlobalState.notCloseWin
        })
    });
    mainWindow.webContents.on('will-navigate', (ev, url) => {
        ev.preventDefault();
        mainWindow.webContents.send('wxScan', url)
    });
    mainWindow.on('close', function (event) {
        beforeClose(event, mainWindow, {
            notCloseWin: allGlobalState.notCloseWin
        })
    });
    // /**
    //  * @Author: zjs
    //  * @Date: 2022-11-14 17:13:47
    //  * @Description:  监听窗口变化
    //  */
    // mainWindow.on('will-resize',(event, newBounds) => {
    //     event.preventDefault(); //拦截，使窗口先不变
    //     const win = event.sender;
    //     const currentSize = win.getSize();
    //     const widthChanged = currentSize[0] != newBounds.width; //判断是宽变了还是高变了，两者都变优先按宽适配
    //     const width = widthChanged?newBounds.width:parseInt(
    //         (realSize.width / realSize.height) * newBounds.height + 0.5
    //     )
    //     const height = widthChanged?parseInt(
    //         newBounds.width / (realSize.width / realSize.height) + 0.5
    //     ):newBounds.height
    //     resizeTimer=null
    //     win.setContentSize(width,height);
    // });
}

app.whenReady().then(() => {
    createWindow();
    console.log('old version')
    if (process.platform == 'win32') {
        autoUpdater.setFeedURL('https://download.haoqixingstem.com/pcgewu/windows/')
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.on('update-downloaded', () => {
            autoUpdater.quitAndInstall();
        });
    }


    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('installCh340', (event) => {
        child.exec(path.join(app.getAppPath(), '../drivers/win', 'SETUP.EXE'));
    });
    /**
     * @Author: zjs
     * @Date: 2022-12-09 18:36:17
     * @Description: 刷新页面
     */
    ipcMain.on('reload', (event) => {
        event.sender.reload()
    });

    /**
     * @Author: zjs
     * @Date: 2022-12-09 18:36:17
     * @Description: 刷新页面
     */
    ipcMain.on('setBluetoothMode', (event, mode) => {
        bluetoothMode = mode
    });


    /**
     * @Author: zjs
     * @Date: 2022-12-09 18:36:17
     * @Description: 结束usb选择
     */
    ipcMain.on('selectOverPort', (event, portId) => {
        allCallback?.selectSerialPortCallback?.(portId)
        allCallback.selectSerialPortCallback = null
    });
    /**
     * @Author: zjs
     * @Date: 2022-12-09 18:36:17
     * @Description: 结束usb选择
     */
    ipcMain.on('setNotCloseWin', (event, val) => {
        allGlobalState.notCloseWin = val
    });

    /**
     * @Author: zjs
     * @Date: 2022-12-22 18:51:09
     * @Description: 手动取消蓝牙扫描
     */
    ipcMain.on('channelBluetoothScanf', (event, msg) => {
        bluetoothScanfCallback?.(''); //reference to callback of win.webContents.on('select-bluetooth-device'...)
        bluetoothScanfCallback = null;
        dialog.showMessageBox(mainWindow, {
            title: '小河狸创客',
            type: 'warning',
            message: msg || '蓝牙未扫描到设备，请重试',
        });
    });

    //cancels Discovery
    ipcMain.on('channelForTerminationSignal', (_) => {
        callbackForBluetoothEvent && callbackForBluetoothEvent(''); //reference to callback of win.webContents.on('select-bluetooth-device'...)
        callbackForBluetoothEvent = null;
        console.log('Discovery cancelled');
    });


    //resolves navigator.bluetooth.requestDevice() and stops device discovery
    ipcMain.on('channelForSelectingDevice', (event, id) => {
        console.log(id)
        callbackForBluetoothEvent(id); //reference to callback of win.webContents.on('select-bluetooth-device'...)
        callbackForBluetoothEvent = null;

        console.log('Device selected, discovery finished');
    });

});


function isWin7() {
    // 当前系统版本号
    const version = os.release();
    const [majorVersion, minorVersion] = version.split('.');

    return majorVersion === '6' && minorVersion === '1';
}
