import { module, test } from "qunit";

import NotificationProviderAuto from "services/notification/providers/auto";


module( "services/notification/providers/auto" );


test( "isSupported", assert => {

	assert.notOk( NotificationProviderAuto.isSupported(), "Is not supported" );

});
