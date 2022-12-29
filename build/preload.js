/*
 * @Author: wrp
 * @Date: 2022-11-17 14:51:50
 * @LastEditors: wrp
 * @LastEditTime: 2022-12-05 10:45:55
 * @Description: 请填写简介
 */
const { contextBridge, ipcRenderer } = require('electron')
const { bluetoothModeEnum } = require('./enum')
window.ipcRenderer = ipcRenderer


/**
 * @Author: zjs
 * @Date: 2022-12-20 14:50:01
 * @Description: 获取蓝牙 mac
 */
ipcRenderer.on('setBluetoothMac', (event,value)=>{
    window.__electronStore.bluetoothMac = value
})

/**
 * @Author: zjs
 * @Date: 2022-12-20 14:50:01
 * @Description:  mac 驱动安装失败
 */
ipcRenderer.on('installMacDriveErr', (event,value)=>{
    window.dispatchEvent(new Event('installMacDriveErr'));
})

/**
 * @Author: zjs
 * @Date: 2022-12-20 14:50:01
 * @Description: 最后一次连接串口的时候扫描到的所有串口
 */
ipcRenderer.on('setLastScanfUsbList', (event,portList)=>{
    window.__electronStore.lastScanfUsbList = portList
    window.dispatchEvent(new Event('__setLastScanfUsbList'));
})

window.electronAPI = {
    reload:()=>ipcRenderer.send('reload'),
    installCh340: () => ipcRenderer.send('installCh340'),
    handleBleListUpdate: (callback) => {
        ipcRenderer.on('channelForBluetoothDeviceList', callback)
    },
    offBleListUpdate: (callback) => {
        ipcRenderer.off('channelForBluetoothDeviceList', callback)
    },
    /**
     * @Author: zjs
     * @Date: 2022-12-23 18:30:47
     * @Description:  通知L6蓝牙连接逻辑 因为之前有gitwulit 逻辑要区分下
     * 设置蓝牙连接逻辑模式
     */    
    setBluetoothMode:(val=bluetoothModeEnum.L6)=>ipcRenderer.send('setBluetoothMode',val),
    /**
     * @Author: zjs
     * @Date: 2022-12-23 18:30:32
     * @Description: 手动取消蓝牙并给提示
     */    
    channelBluetoothScanf:(msg)=>ipcRenderer.send('channelBluetoothScanf'),
    cancelBle:()=>ipcRenderer.send('channelForTerminationSignal'),
    connectBleDevice: (id) => {
        ipcRenderer.send('channelForSelectingDevice', id)
    },
    downloadUrl: (url) => {
        ipcRenderer.send('channelForDown', url)
    },
    /**
     * @Author: zjs
     * @Date: 2022-12-23 18:30:27
     * @Description: usb 选择完毕
     */    
    selectOverPort:(portId)=>{
        ipcRenderer.send('selectOverPort', portId)

    },
    /**
     * @Author: zjs
     * @Date: 2022-12-26 14:35:10
     * @Description: 设置是否允许强制关闭窗口
     */    
    setNotCloseWin:(val)=>{
        ipcRenderer.send('setNotCloseWin', val)
    },
    /**
     * @Author: zjs
     * @Date: 2022-12-28 15:12:08
     * @Description: 安装mac 驱动
     */    
    installMacDrive: () => ipcRenderer.send('installMacDrive')

}
window.__electronStore = {
    bluetoothMac:''
}

