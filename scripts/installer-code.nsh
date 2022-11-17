; 自定义安装位置，安装到公共用户目录，所有用户都有读写权限，可正常增量更新
!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode_code"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode_code"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode_code"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "C:\Users\Public\Programs\gewucode_code"
!macroend

!macro customInstall
  DetailPrint "Register gewucode_code URI Handler"
  DeleteRegKey HKCR "gewucode_code"
  WriteRegStr HKCR "gewucode_code" "" "gewucode_code"
  WriteRegStr HKCR "gewucode_code" "URL Protocol" ""
  WriteRegStr HKCR "gewucode_code\shell" "" ""
  WriteRegStr HKCR "gewucode_code\shell\Open" "" ""
  WriteRegStr HKCR "gewucode_code\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
  ExecWait '"$INSTDIR\resources\drivers\win\SETUP.EXE" \s' 
!macroend

!macro customUnInstall

!macroend