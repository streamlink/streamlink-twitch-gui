import NotificationProvider from "./NotificationProvider";
import NotificationCenter from "node-notifier/notifiers/notificationcenter";
import { main } from "config";
import FS from "fs";
import PATH from "path";
import UTIL from "util";


// require binary dependencies
// avoid using webpack's buggy recursive require.context method and list files explicitly
require(
	  "file?name=bin/terminal-notifier.app/Contents/MacOS/terminal-notifier!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/MacOS/terminal-notifier"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/Resources/en.lproj/InfoPlist.strings!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/Resources/en.lproj/InfoPlist.strings"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/Resources/en.lproj/MainMenu.nib!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/Resources/en.lproj/MainMenu.nib"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/Resources/en.lproj/Credits.rtf!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/Resources/en.lproj/Credits.rtf"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/Resources/Terminal.icns!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/Resources/Terminal.icns"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/Info.plist!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/Info.plist"
);
require(
	  "file?name=bin/terminal-notifier.app/Contents/PkgInfo!"
	+ "node-notifier/vendor/terminal-notifier.app/Contents/PkgInfo"
);


const {
	"display-name": displayName,
	"app-identifier": appIdentifier
} = main;


function NotificationProviderNotificationCenter() {
	let customPath = PATH.resolve(
		"bin", "terminal-notifier.app", "Contents", "MacOS", "terminal-notifier"
	);

	// fix executable permissions
	FS.chmodSync( customPath, "755" );

	this.provider = new NotificationCenter({
		withFallback: false,
		customPath
	});
}

UTIL.inherits( NotificationProviderNotificationCenter, NotificationProvider );

NotificationProviderNotificationCenter.platforms = {
	mountainlion: "growl"
};

/**
 * @returns {Promise}
 */
NotificationProviderNotificationCenter.test = function() {
	return Promise.resolve();
};

NotificationProviderNotificationCenter.prototype.notify = function( data ) {
	data.subtitle = displayName;

	// https://github.com/julienXX/terminal-notifier#options
	data.sender = appIdentifier;
	data.group = data.sender;
	data.remove = data.group;

	return NotificationProvider.prototype.notify.call( this, data );
};


export default NotificationProviderNotificationCenter;
