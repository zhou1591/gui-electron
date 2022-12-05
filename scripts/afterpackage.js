const shell = require('shelljs');
const appJson = require('../build/package.json');
const moment = require('moment');
const path = require('path');
const fs = require('fs');



const packageInfoFilePath = path.join(__dirname, 'package-info.json');


exports.default = async function (context) {
    let packageInfo = {};
    let packageTarget = context.artifactPaths[1] || context.artifactPaths[0];
    console.log(context);

    console.log('---------- 重命名 --------');
    let temp = packageTarget && packageTarget.split('.') || null;
    if (!temp) {
        console.log('更名失败');
        return;
    }
    let type = temp[temp.length - 1];
    let timefix = moment().format('MMDDHHmm');
    
    let newName = `gewucode-${appJson.version}-${timefix}.${type}`;
    let renameTarget = path.join(context.outDir, newName);
    // console.log(renameTarget);

    // 将信息写入本地文件
    packageInfo.packagePath = renameTarget;
    packageInfo.packageName = newName;

    fs.writeFileSync(packageInfoFilePath, JSON.stringify(packageInfo, null, 2), 'utf8');

    // 更名
    shell.mv(packageTarget, renameTarget);


};
