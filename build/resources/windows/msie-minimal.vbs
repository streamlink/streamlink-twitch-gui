Dim objIENoToolbars
Set objIENoToolbars = WScript.CreateObject("InternetExplorer.Application")
ObjIENoToolbars.Toolbar = false
objIENoToolbars.Navigate WScript.Arguments.Item(0)
objIENoToolbars.Visible = true
