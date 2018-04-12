import NotificationProviderAuto from "./auto";
import NotificationProviderSnoreToast from "./snoretoast";
import NotificationProviderNative from "./native";
import NotificationProviderGrowl from "./growl";
import NotificationProviderRich from "./rich";


/**
 * @interface NotificationProvider
 */
/**
 * @function
 * @name NotificationProvider.isSupported
 * @returns {boolean}
 */
/**
 * @function
 * @name NotificationProvider#setup
 * @returns {Promise}
 */
/**
 * @function
 * @name NotificationProvider#notify
 * @params {NotificationData} data
 * @returns {Promise}
 */


/** @type {Object.<string, (NotificationProvider|function(new:NotificationProvider))>} */
export default {
	// special provider for always using fallbacks
	"auto": NotificationProviderAuto,
	// notifications provider that uses the operating system's native notifications
	"native": NotificationProviderNative,
	// helper providers for native notifications
	"snoretoast": NotificationProviderSnoreToast,
	// non-native providers
	"growl": NotificationProviderGrowl,
	"rich": NotificationProviderRich
};
