import { module, test } from "qunit";

import notificationProviderNativeInjector
	from "inject-loader!services/notification/providers/native";


module( "services/notification/providers/native" );


test( "isSupported", assert => {

	let NotificationProviderNative;

	NotificationProviderNative = notificationProviderNativeInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {
			isDarwin: true,
			isLinux: false
		}
	})[ "default" ];

	assert.ok( NotificationProviderNative.isSupported(), "Supported on macOS" );

	NotificationProviderNative = notificationProviderNativeInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {
			isDarwin: false,
			isLinux: true
		}
	})[ "default" ];

	assert.ok( NotificationProviderNative.isSupported(), "Supported on Linux" );

	NotificationProviderNative = notificationProviderNativeInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {
			isDarwin: false,
			isLinux: false
		}
	})[ "default" ];

	assert.notOk( NotificationProviderNative.isSupported(), "Not supported on other OSes" );

});


test( "supportsListNotifications", assert => {

	const { default: NotificationProviderRich } = notificationProviderNativeInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {}
	});

	assert.notOk( NotificationProviderRich.supportsListNotifications(), "Does not support lists" );

});
