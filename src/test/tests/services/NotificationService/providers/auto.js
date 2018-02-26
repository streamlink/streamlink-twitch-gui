import { module, test } from "qunit";

import NotificationProviderAuto from "services/NotificationService/providers/auto";


module( "services/NotificationService/providers/auto" );


test( "isSupported", assert => {

	assert.notOk( NotificationProviderAuto.isSupported(), "Is not supported" );

});
