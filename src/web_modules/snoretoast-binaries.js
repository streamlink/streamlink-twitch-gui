// import snoretoast binary dependencies
// see services/NotificationService/provider/snoretoast

// list files explicitly
// and move them to the bin/win{32,64}/ directory
import "file-loader?name=bin/win32/snoretoast.exe!snoretoast/bin/x86/SnoreToast.exe";
import "file-loader?name=bin/win64/snoretoast.exe!snoretoast/bin/x64/SnoreToast.exe";


export default {
	x86: [ "bin", "win32", "snoretoast.exe" ],
	x64: [ "bin", "win64", "snoretoast.exe" ]
};
