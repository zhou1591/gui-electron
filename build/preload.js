/*
 * @Author: wrp
 * @Date: 2022-11-17 14:51:50
 * @LastEditors: wrp
 * @LastEditTime: 2022-12-05 10:45:55
 * @Description: 请填写简介
 */
const { contextBridge, ipcRenderer } = require('electron')
window.ipcRenderer = ipcRenderer

// 此种方式ipcrender off不能正常工作 见https://github.com/reZach/secure-electron-template/issues/43
// contextBridge.exposeInMainWorld('electronAPI',{
//     installCh340: () => ipcRenderer.send('installCh340'),
//     handleBleListUpdate: (callback) => {
//         ipcRenderer.on('channelForBluetoothDeviceList', callback)
//     },
//     offBleListUpdate: (callback) => {
//         ipcRenderer.off('channelForBluetoothDeviceList', callback)
//     },
//     cancelBle:()=>ipcRenderer.send('channelForTerminationSignal'),
//     connectBleDevice: (id) => {
//         console.log('ddddd', id)
//         ipcRenderer.send('channelForSelectingDevice', id)
//     },
//     ipcRenderer
// })
ipcRenderer.on('setBluetoothMac', (event,value)=>{
    window.__electronStore.bluetoothMac = value
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
    cancelBle:()=>ipcRenderer.send('channelForTerminationSignal'),
    connectBleDevice: (id) => {
        console.log('ddddd', id)
        ipcRenderer.send('channelForSelectingDevice', id)
    },
    downloadUrl: (url) => {
        ipcRenderer.send('channelForDown', url)
    }
}
window.__electronStore = {
    bluetoothMac:''
}
