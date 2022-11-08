; 自定义安装位置，安装到公共用户目录，所有用户都有读写权限，可正常增量更新
!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode"
!macroend

!macro customInstall
  DetailPrint "Register gewucode URI Handler"
  DeleteRegKey HKCR "gewucode"
  WriteRegStr HKCR "gewucode" "" "gewucode"
  WriteRegStr HKCR "gewucode" "URL Protocol" ""
  WriteRegStr HKCR "gewucode\shell" "" ""
  WriteRegStr HKCR "gewucode\shell\Open" "" ""
  WriteRegStr HKCR "gewucode\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
  ExecWait '"$INSTDIR\resources\drivers\win\SETUP.EXE" \s' 
!macroend

!macro customUnInstall

!macroend