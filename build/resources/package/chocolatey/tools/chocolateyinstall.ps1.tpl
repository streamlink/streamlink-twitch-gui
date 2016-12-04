$packageName = 'streamlink-twitch-gui'
$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$installDir = "$(Split-Path -parent $toolsDir)"
$extractDir = "$(Split-Path -parent $installDir)"

Install-ChocolateyZipPackage `
	-PackageName    $packageName `
	-Url            "https://github.com/streamlink/streamlink-twitch-gui/releases/download/v<%- version %>/streamlink-twitch-gui-v<%- version %>-win32.zip" `
	-Checksum       "<%= checksum %>" `
	-ChecksumType   "sha256" `
	-Url64bit       "https://github.com/streamlink/streamlink-twitch-gui/releases/download/v<%- version %>/streamlink-twitch-gui-v<%- version %>-win64.zip" `
	-Checksum64     "<%= checksum64 %>" `
	-ChecksumType64 "sha256" `
	-UnzipLocation  "$extractDir"

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutFile = Join-Path $desktop "$($packageName).lnk"
$exeFile = Join-Path $installDir "$($packageName).exe"
Install-ChocolateyShortcut -shortcutFilePath $shortcutFile -targetPath $exeFile
