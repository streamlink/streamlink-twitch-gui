// import snoretoast binary dependencies
// see services/NotificationService/provider/snoretoast

// list files explicitly
// and move them to the bin/win{32,64}/ directory
import "file-loader?name=bin/win32/snoretoast.exe!snoretoast/bin/32/snoretoast.exe";
import "file-loader?name=bin/win32/snoretoast-LICENSE.txt!snoretoast/COPYING.LGPL-3";
import "file-loader?name=bin/win64/snoretoast.exe!snoretoast/bin/64/snoretoast.exe";
import "file-loader?name=bin/win64/snoretoast-LICENSE.txt!snoretoast/COPYING.LGPL-3";


export default {
	x86: [ "bin", "win32", "snoretoast.exe" ],
	x64: [ "bin", "win64", "snoretoast.exe" ]
};
