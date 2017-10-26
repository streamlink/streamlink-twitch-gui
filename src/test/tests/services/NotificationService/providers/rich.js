import {
	module,
	test
} from "qunit";
import notificationProviderRichInjector
	from "inject-loader!services/NotificationService/providers/rich";


module( "services/NotificationService/providers/rich" );


test( "isSupported", assert => {

	let NotificationProviderRich;

	NotificationProviderRich = notificationProviderRichInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {
			isWin7: true
		}
	})[ "default" ];

	assert.ok( NotificationProviderRich.isSupported(), "Is supported on Win7" );

	NotificationProviderRich = notificationProviderRichInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {
			isWin7: false
		}
	})[ "default" ];

	assert.notOk( NotificationProviderRich.isSupported(), "Is not supported on other OSes" );

});


test( "supportsListNotifications", assert => {

	const { default: NotificationProviderRich } = notificationProviderRichInjector({
		"./chrome-notifications": class {},
		"utils/node/platform": {}
	});

	assert.ok( NotificationProviderRich.supportsListNotifications(), "Does support lists" );

});
