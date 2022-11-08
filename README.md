


## 环境
windows系统node必须为32位, 才能打32位exe包（兼容windows 32位系统，32位不能打开64位exe） 


## 第一次部署项目到本地
### 安装依赖
```
yarn i
```


### 拷贝前端项目文件

手动把h-openblock-gui的pd端编译后的代码复制到build目录下，并且文件夹名命名为www
手动解压项目根目录assets.zip到build目录下，文件名为assets，此为scratch角色相关资源，官方原版是用的在线网址



### 调试（基于 build/ 目录）

```
npm run start
```

### 打包（基于 build/ 目录）

```
npm run packages
```



### 打出来的包文件名结构：

由 `scripts/afterpack.js` 脚本处理

```
${productionName}-${version}-${MMDDHHmm}.exe
```
- ${productionName} 位于 `electron-builder-config.js`
- ${MMDDHHmm} 遵循格式月天时分


