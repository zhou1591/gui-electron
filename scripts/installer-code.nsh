Function func
  nsProcessW::_FindProcess "小河狸创客.exe" $R0
  Pop $0
  StrCmp $0 "0" 0 +5
  MessageBox MB_OK "当前有小河狸创客正在运行需要点击关闭.exe"
  nsProcessW::_KillProcess "小河狸创客.exe"
  Sleep 2000
  Call func
  
FunctionEnd

!macro customInit
  Call func
!macroend

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