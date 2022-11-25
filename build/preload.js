/*
 * @Author: wrp
 * @Date: 2022-11-17 14:51:50
 * @LastEditors: wrp
 * @LastEditTime: 2022-11-24 15:29:37
 * @Description: 请填写简介
 */
const { contextBridge, ipcRenderer } = require('electron')
window.electron = require('electron')

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

window.electronAPI = {
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
