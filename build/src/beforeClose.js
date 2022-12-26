const { dialog } = require('electron');
/**
 * @Author: zjs
 * @Date: 2022-12-22 19:18:18
 * @Description: 关闭窗口前
 */   
const beforeClose = (ev,mainWindow,{notCloseWin}={})=>{
    if(notCloseWin){
        dialog.showMessageBox(mainWindow, {
            title: '小河狸创客',
            type: 'warning',
            message: '固件正在升级中，请勿关闭窗口~',
        });
        ev.preventDefault();
        return 
    }
    const choice = dialog.showMessageBoxSync(mainWindow, {
        title: '小河狸创客',
        type: 'question',
        message: '请确实是否退出客户端？',
        buttons: ['不退出', '确认退出'],
        cancelId: 0, // closing the dialog means "stay"
        defaultId: 0, // pressing enter or space without explicitly selecting something means "stay"
    });
    const shouldQuit = choice === 0;
    if (shouldQuit) {
        ev.preventDefault();
    }
}

module.exports = beforeClose