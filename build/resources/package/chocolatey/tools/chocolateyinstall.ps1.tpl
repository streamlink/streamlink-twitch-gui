$packageName = 'livestreamer-twitch-gui'
$url = 'https://github.com/bastimeyer/livestreamer-twitch-gui/releases/download/v<%- version %>/livestreamer-twitch-gui-v<%- version %>-win32.zip'
$url64 = 'https://github.com/bastimeyer/livestreamer-twitch-gui/releases/download/v<%- version %>/livestreamer-twitch-gui-v<%- version %>-win64.zip'
$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$installDir = "$(Split-Path -parent $toolsDir)"
$extractDir = "$(Split-Path -parent $installDir)"

Install-ChocolateyZipPackage "$packageName" "$url" "$extractDir" "$url64"

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutFile = Join-Path $desktop "$($packageName).lnk"
$exeFile = Join-Path $installDir "$($packageName).exe"
Install-ChocolateyShortcut -shortcutFilePath $shortcutFile -targetPath $exeFile -arguments "--no-version-check"
