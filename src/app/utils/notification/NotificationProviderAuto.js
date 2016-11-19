import NotificationProvider from "./NotificationProvider";
import UTIL from "util";


function NotificationProviderAuto() {}

UTIL.inherits( NotificationProviderAuto, NotificationProvider );

NotificationProviderAuto.platforms = {
	win32: "growl",
	win32gte8: "toast",
	darwin: "notificationcenter",
	linux: "libnotify"
};

NotificationProviderAuto.test = function() {
	return Promise.reject();
};


export default NotificationProviderAuto;
