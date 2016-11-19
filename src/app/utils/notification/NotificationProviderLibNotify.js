import NotificationProvider from "./NotificationProvider";
import LibNotify from "node-notifier/notifiers/notifysend";
import which from "utils/node/fs/which";
import UTIL from "util";


function NotificationProviderLibNotify() {
	this.provider = new LibNotify({
		// don't run `which notify-send` twice
		suppressOsdCheck: true
	});
}

UTIL.inherits( NotificationProviderLibNotify, NotificationProvider );

NotificationProviderLibNotify.platforms = {
	linux: "growl"
};

/**
 * @returns {Promise}
 */
NotificationProviderLibNotify.test = function() {
	return which( "notify-send" );
};


export default NotificationProviderLibNotify;
