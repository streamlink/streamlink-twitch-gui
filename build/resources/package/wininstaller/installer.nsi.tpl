!define AppName "<%= name %>"
!define DisplayName "<%= displayname %>"
!define Author "<%= author %>"
!define Homepage "<%= homepage %>"
!define ReleaseVersion "<%= version %>"
!define ReleaseNotes "${Homepage}/releases/v${ReleaseVersion}"
!define Arch "<%= arch %>"

!define AppDir "${DisplayName}"
!define AppFile "${AppName}.exe"
!define InstallerFile "<%= filename %>"
!define UninstallerFile "Uninstall ${DisplayName}.exe"

!define RegKeyInstall "SOFTWARE\${AppName}"
!define RegKeyUninstall "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${AppName}"

!define KillCmd 'cmd /c taskkill /f /im "${AppFile}" /fi "WINDOWTITLE eq ${DisplayName}"'


# Modules
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"


# Installer/Uninstaller params
Name "${DisplayName}"
Caption "${DisplayName} - v${ReleaseVersion}"
BrandingText "${DisplayName} - v${ReleaseVersion}"
ShowInstDetails show
ShowUninstDetails show
InstallDir ""
InstallDirRegKey HKLM "${RegKeyInstall}" "InstallPath"


# Package params
CRCCheck on
SetCompressor /SOLID lzma


# NSIS Installer output dir
OutFile "<%= diroutput %>/${InstallerFile}"


# Metadata params
VIProductVersion "${ReleaseVersion}.0"
VIAddVersionKey "ProductName" "${DisplayName}"
VIAddVersionKey "ProductVersion" "${ReleaseVersion}"
VIAddVersionKey "FileDescription" "${DisplayName}"
VIAddVersionKey "FileVersion" "${ReleaseVersion}"
VIAddVersionKey "LegalCopyright" "${Author}"


# GUI
!define MUI_ICON "<%= dirroot %>/build/resources/icons/icon-16-32-48-256.ico"
!define MUI_WELCOMEPAGE_TITLE "${DisplayName} - v${ReleaseVersion}"
!define MUI_WELCOMEPAGE_TITLE_3LINES
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_CANCEL_DEFAULT
!define MUI_FINISHPAGE_NOAUTOCLOSE
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${DisplayName}"
!define MUI_FINISHPAGE_RUN "$INSTDIR\${AppFile}"
!define MUI_FINISHPAGE_NOREBOOTSUPPORT
!define MUI_FINISHPAGE_SHOWREADME "${ReleaseNotes}"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Open release notes in web browser"
!define MUI_UNICON "${NSISDIR}/Contrib/Graphics/Icons/modern-uninstall.ico"
!define MUI_UNFINISHPAGE_NOAUTOCLOSE
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH
!insertmacro MUI_LANGUAGE "English"


# Installer
Section
	DetailPrint '${KillCmd}'
	nsExec::Exec /TIMEOUT=3000 '${KillCmd}'

	RMDir /r $INSTDIR
	SetOutPath $INSTDIR
	File /r "<%= dirinput %>\*"

	WriteUninstaller "$INSTDIR\${UninstallerFile}"

	CreateShortCut "$DESKTOP\${DisplayName}.lnk" "$INSTDIR\${AppFile}"

	WriteRegStr HKLM "${RegKeyInstall}" "InstallPath" "$INSTDIR"
	WriteRegStr HKLM "${RegKeyUninstall}" "DisplayName" "${DisplayName}"
	WriteRegStr HKLM "${RegKeyUninstall}" "UninstallString" "$INSTDIR\${UninstallerFile}"
	WriteRegStr HKLM "${RegKeyUninstall}" "DisplayIcon" "$INSTDIR\${AppFile}"
	WriteRegStr HKLM "${RegKeyUninstall}" "DisplayVersion" "${ReleaseVersion}"
	WriteRegStr HKLM "${RegKeyUninstall}" "Publisher" "${Author}"
	WriteRegStr HKLM "${RegKeyUninstall}" "URLInfoAbout" "${Homepage}"
	WriteRegStr HKLM "${RegKeyUninstall}" "HelpLink" "${Homepage}"

	${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
	IntFmt $0 "0x%08X" $0
	WriteRegDWORD HKLM "${RegKeyUninstall}" "EstimatedSize" "$0"
SectionEnd

# Uninstaller
Section "Uninstall"
	DetailPrint '${KillCmd}'
	nsExec::Exec /TIMEOUT=3000 '${KillCmd}'

	RMDir /r $INSTDIR
	delete "$DESKTOP\${DisplayName}.lnk"
	DeleteRegKey HKLM "${RegKeyInstall}"
	DeleteRegKey HKLM "${RegKeyUninstall}"
SectionEnd


# Functions
Function .onInit
	${If} $InstDir == ""
		${If} ${RunningX64}
			StrCpy $InstDir "$PROGRAMFILES64\${AppDir}\"
		${Else}
			StrCpy $InstDir "$PROGRAMFILES32\${AppDir}\"
		${EndIf}
	${EndIf}
FunctionEnd
