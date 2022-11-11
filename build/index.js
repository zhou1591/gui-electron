const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const child = require('child_process');

const path = require('path');
const os = require('os');
const fs = require('fs')
const { getFilterForExtension } = require('./FileFilters');

let callbackForBluetoothEvent = null;


app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
const gewubanVendorId = '6790';
const gewubanProductId = '29987';

if (isWin7()) {
    // 解决win7有些系统白屏的问题
    app.disableHardwareAcceleration();
}


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 800,
        // width: 2560,
        // height: 1080,
        title: 'Gewucode v0.1',
        icon: path.join(__dirname, './www/static/favicon.png'),
        webPreferences: {

            nodeIntegration: false,

            contextIsolation:false,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    mainWindow.webContents.on(
        'select-bluetooth-device',
        (event, deviceList, callback) => {
            event.preventDefault();
 
 
            console.log(deviceList, deviceList.length);
            console.log('-------------');
            // if (deviceList && deviceList.length > 12) {
            //     callback(deviceList[0].deviceId);
            // }
            callbackForBluetoothEvent = callback

            mainWindow.webContents.send('channelForBluetoothDeviceList', deviceList);
            // for (let i = 0; i < deviceList.length; i++) {
            //     if (deviceList[i].deviceId.indexOf('9E') > -1) {
            //         callback(deviceList[i].deviceId);
            //     }
            // }
            // callback(deviceList[0].deviceId);
        }
    );

    mainWindow.webContents.session.on(
        'select-serial-port',
        (event, portList, webContents, callback) => {
            event.preventDefault();
            // callbackForSerialPortEvent = callback
            // mainWindow.webContents.send('serialPortList',portList)
            for (let i = 0; i < portList.length; i++) {
                const item = portList[i];
                if (item.vendorId === gewubanVendorId && item.productId === gewubanProductId) {
                    callback(item.portId);
                    return
                }

            }
            callback(''); //Could not find any matching devices
            dialog.showMessageBox(mainWindow, {
                title: 'Gewucode',
                type: 'warning',
                message: '未检测到设备插入'
            })
        }
    );

    mainWindow.webContents.session.on('serial-port-added', (event, port) => {
        console.log('serial-port-added FIRED WITH', port);
    });

    mainWindow.webContents.session.on('serial-port-removed', (event, port) => {
        console.log('serial-port-removed FIRED WITH', port);
    });

    // let mainUrl = `file://${path.join(__dirname, './www/index.html')}`;
    let mainUrl = `file://${path.join(__dirname, './www/l6Course.html')}`;
    // mainUrl = `file://${path.join(__dirname, './index.html')}`;

    // mainUrl = 'http://localhost:8601/';

    mainWindow.loadURL(mainUrl);
    // mainWindow.setMenu(null);



    const getIsProjectSave = downloadItem => {
        switch (downloadItem.getMimeType()) {
        case 'application/x.gewucode.hb':
            return true;
        }
        return false;
    };

    mainWindow.webContents.session.on('will-download', (willDownloadEvent, downloadItem) => {
        const isProjectSave = getIsProjectSave(downloadItem);
        const itemPath = downloadItem.getFilename();
        const baseName = path.basename(itemPath);
        const extName = path.extname(baseName);
        const options = {
            defaultPath: baseName
        };
        if (extName) {
            const extNameNoDot = extName.replace(/^\./, '');
            options.filters = [getFilterForExtension(extNameNoDot)];
        }
        const userChosenPath = dialog.showSaveDialogSync(mainWindow, options);
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
                        const newProjectTitle = path.basename(userChosenPath, extName);
                        mainWindow.webContents.send('setTitleFromSave', { title: newProjectTitle });

                    }
                } catch (e) {

                    // don't clean up until after the message box to allow troubleshooting / recovery
                    await dialog.showMessageBox(mainWindow, {
                        type: 'error',
                        title: 'Failed to save project',
                        message: `Save failed:\n${userChosenPath}`,
                        detail: e.message
                    });

                }
            });
        } else {
            downloadItem.cancel();
        }
    })


    mainWindow.webContents.on('will-prevent-unload', ev => {
        const choice = dialog.showMessageBoxSync(mainWindow, {
            title: 'Gewucode',
            type: 'question',
            message: '确定关闭Gewucode?',
            detail: '未保存的内容将会丢失',
            buttons: ['取消', '确定'],
            cancelId: 0, // closing the dialog means "stay"
            defaultId: 0 // pressing enter or space without explicitly selecting something means "stay"
        });
        const shouldQuit = (choice === 1);
        if (shouldQuit) {
            ev.preventDefault();
        }
    });
    mainWindow.webContents.on('will-navigate', (ev, url) => {
        ev.preventDefault()
        console.log(url)
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on('installCh340', (event) => {
        console.log('1', app.getAppPath())
        child.exec(path.join(
            app.getAppPath(),
            '../drivers/win',
            'SETUP.EXE'
        ));
    });

    //cancels Discovery
    ipcMain.on('channelForTerminationSignal', _ => {
        callbackForBluetoothEvent && callbackForBluetoothEvent(''); //reference to callback of win.webContents.on('select-bluetooth-device'...)
        callbackForBluetoothEvent = null
        console.log("Discovery cancelled");
    });

    //resolves navigator.bluetooth.requestDevice() and stops device discovery
    ipcMain.on('channelForSelectingDevice', (event, id) => {
        callbackForBluetoothEvent(id); //reference to callback of win.webContents.on('select-bluetooth-device'...)
        callbackForBluetoothEvent = null
        
        console.log("Device selected, discovery finished");
    })
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

function isWin7 () {
    // 当前系统版本号
    const version = os.release();
    const [majorVersion, minorVersion] = version.split('.');

    return majorVersion === '6' && minorVersion === '1'
};