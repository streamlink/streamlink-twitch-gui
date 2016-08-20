import NotificationProvider from "./NotificationProvider";
import LibNotify from "node-notifier/notifiers/notifysend";
import which from "utils/node/fs/which";
import UTIL from "util";


function NotificationProviderLibNotify() {
	this.provider = new LibNotify();
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
