set WshShell = WScript.CreateObject("WScript.Shell")
set oShellLink = WshShell.CreateShortcut( WScript.Arguments.Item(0) )
oShellLink.TargetPath = WScript.Arguments.Item(1)
oShellLink.WorkingDirectory = WScript.Arguments.Item(2)
oShellLink.IconLocation = WScript.Arguments.Item(1) & ", 0"
oShellLink.Description = WScript.Arguments.Item(3)
oShellLink.WindowStyle = 1
oShellLink.Hotkey = ""
oShellLink.Save
