$packageName = 'streamlink-twitch-gui'
$packageParameters = $env:chocolateyPackageParameters

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutFile = Join-Path $desktop "$($packageName).lnk"
if (Test-Path $shortcutFile){
    Remove-Item $shortcutFile
}

$toolsDir = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$installDir = "$(Split-Path -parent $toolsDir)"
if (Test-Path $installDir){
    Remove-Item -Recurse $installDir
}


if ($packageParameters) {
    $match_pattern = "\/[Pp]urge"

    if ($packageParameters -match $match_pattern){
        $appDataDir = Join-Path $env:LOCALAPPDATA $packageName
        if (Test-Path $appDataDir){
            Remove-Item -Recurse $appDataDir
        }

        $tempDir = Join-Path $env:TEMP $packageName
        if (Test-Path $tempDir){
            Remove-Item -Recurse $tempDir
        }
    }
}