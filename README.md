## 环境

windows 系统 node 必须为 32 位, 才能打 32 位 exe 包（兼容 windows 32 位系统，32 位不能打开 64 位 exe）

## 第一次部署项目到本地

### 安装依赖

```
npm i
```

### 拷贝前端项目文件

手动把 h-openblock-gui 的 pd 端编译后的代码复制到 build 目录下，并且文件夹名命名为 www
手动解压项目根目录 assets.zip 到 build 目录下，文件名为 assets，此为 scratch 角色相关资源，官方原版是用的在线网址

### 调试（基于 build/ 目录）

```
npm run start
```

### 打包（基于 build/ 目录）

windows 打包前安装插件，https://nsis.sourceforge.io/NsProcess_plugin 下载，解压后负值 plugin 里的两个 dll 至 C:\Users\用户名\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Plugins\x86-unicode

```
npm run packages
```

### 打出来的包文件名结构：

由 `scripts/afterpack.js` 脚本处理

```
${productionName}-${version}-${MMDDHHmm}.exe
```

-   ${productionName} 位于 `electron-builder-config.js`
-   ${MMDDHHmm} 遵循格式月天时分
