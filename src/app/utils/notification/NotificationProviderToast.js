import NotificationProvider from "./NotificationProvider";
import Toaster from "node-notifier/notifiers/toaster";
import resolvePath from "utils/node/resolvePath";
import UTIL from "util";


// require binary dependencies
// avoid using webpack's buggy recursive require.context method and list files explicitly
require(
	"file?name=bin/Microsoft.WindowsAPICodePack.Shell.dll!"
	+ "node-notifier/vendor/toaster/Microsoft.WindowsAPICodePack.Shell.dll"
);
require(
	"file?name=bin/Microsoft.WindowsAPICodePack.dll!"
	+ "node-notifier/vendor/toaster/Microsoft.WindowsAPICodePack.dll"
);
require(
	"file?name=bin/toast.exe!"
	+ "node-notifier/vendor/toaster/toast.exe"
);


function NotificationProviderToast() {
	let customPath = resolvePath( "%NWJSAPPPATH%", "bin", "toast.exe" );

	this.provider = new Toaster({
		withFallback: false,
		customPath
	});
}

UTIL.inherits( NotificationProviderToast, NotificationProvider );

NotificationProviderToast.platforms = {
	win32gte8: "growl"
};

/**
 * @returns {Promise}
 */
NotificationProviderToast.test = function() {
	return Promise.resolve();
};


export default NotificationProviderToast;
