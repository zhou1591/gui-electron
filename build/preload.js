const { contextBridge, ipcRenderer } = require('electron')


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
    }
}