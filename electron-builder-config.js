// const appConfig = require('./app/app.json');

// 只打包硬件的版本
const onlyCode =  process.env.packageMode === 'onlyCode'
const config = {
  productName:onlyCode?'小河狸创客-硬件测试版':'小河狸创客',
  appId:onlyCode?'onlyCode.gewucode':'l6.gewucode',
  output:onlyCode?'dist2':'dist',
  nsis:onlyCode?'./scripts/installer-code.nsh':'./scripts/installer.nsh',
}
module.exports = {
  productName: config.productName,
  appId: config.appId,
  copyright: 'gewucode team',
  asar: false,
  compression: 'maximum',
  nodeGypRebuild: false,
  // afterSign: './scripts/after-sign.js',
  // afterSign: null,
  afterAllArtifactBuild: './scripts/afterpackage.js',
  artifactName: 'gewucode-l6-${version}.${ext}',
  directories: { buildResources: 'resources', output: config.output, app: 'build' },
  mac: {
    // target: [ 'dmg' ],
    target: ['pkg'],
    icon: './resources/app-icon/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: './entitlements.mac.plist',
    entitlementsInherit: './entitlements.mac.plist',
    extraFiles: ['./resources/app-icon'],
    extendInfo: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: "Mblock5Protocol"
        },
        {
          CFBundleURLSchemes: [
            "gewucode"
          ]
        }
      ]
    },
    fileAssociations: [
      {
        icon: './resources/app-icon/mk.icns',
        ext: 'gewucode',
        name: 'gewucode',
        description: 'gewucode project'
      },
      {
        icon: './resources/app-icon/mk.icns',
        ext: 'mcode',
        name: 'mcode',
        description: 'mcode project'
      },
      {
        icon: './resources/app-icon/sb3.icns',
        ext: 'sb3',
        name: 'sb3',
        description: 'scratch3.0 project'
      },
      {
        icon: './resources/app-icon/sb2.icns',
        ext: 'sb2',
        name: 'sb2',
        description: 'scratch2.0 project'
      },
      {
        icon: './resources/app-icon/mext.icns',
        ext: 'mext',
        name: 'mext',
        description: 'gewucode extension'
      }
    ]
  },
  dmg: {
    background: './resources/bg.png',
    sign: false,
    contents: [
      {
        x: 130,
        y: 215
      },
      {
        x: 400,
        y: 215,
        type: "link",
        path: "/Applications"
      }
    ]
  },
  pkg: {
    scripts: '../scripts/pkg-scripts',
    overwriteAction: 'upgrade',
    isRelocatable: false,
    // 这三行作用：只允许在特定路径安装
    allowAnywhere: false,
    allowCurrentUserHome: false,
    installLocation: '/Applications/Gewucode(L6)'
  },

  win: {
    icon: './resources/app-icon/icon.ico',
    extraFiles: ['./resources'],
    target: [{
      target: 'nsis',
      arch: [
        'ia32'
      ]
    }],
    fileAssociations: [
      {
        icon: './resources/app-icon/icon.ico',
        ext: 'gewucode',
        name: 'gewucode',
        description: 'gewucode project'
      },
      {
        icon: './resources/app-icon/icon.ico',
        ext: 'hb',
        name: 'hb',
        description: 'gewucode project'
      },
      {
        icon: './resources/app-icon/icon.ico',
        ext: 'sb3',
        name: 'sb3',
        description: 'scratch3.0 project'
      }
      ,
      {
        icon: './resources/app-icon/icon.ico',
        ext: 'sb2',
        name: 'sb2',
        description: 'scratch2.0 project'
      }
      // ,
      // {
      //   icon: './resources/app-icon/mext.ico',
      //   ext: 'mext',
      //   name: 'mext',
      //   description: 'gewucode extension'
      // }
    ]
  },
  nsis: {
    allowToChangeInstallationDirectory: false,
    oneClick: false,
    menuCategory: true,
    include: config.nsis,
    allowElevation: true,
    perMachine: true,
    createDesktopShortcut: 'always',

  },
  linux: { category: 'Development', target: ['deb', 'rpm'] },
  deb: {
    depends: [
      'gconf2',
      'gconf-service',
      'libnotify4',
      'libappindicator1',
      'libxtst6',
      'libnss3',
      'libsecret-1-0'
    ]
  }
};