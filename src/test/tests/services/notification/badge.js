import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import notificationServiceBadgeMixinInjector
	from "inject-loader?nwjs/Window!services/notification/badge";


module( "services/notification/badge" );


test( "Badge", assert => {

	assert.expect( 5 );

	let expected = "";

	const { default: NotificationServiceBadgeMixin } = notificationServiceBadgeMixinInjector({
		"nwjs/Window": {
			setBadgeLabel( label ) {
				assert.strictEqual( label, expected, "Sets the badge label" );
			}
		}
	});

	const owner = buildOwner();

	owner.register( "service:settings", Service.extend({
		notification: {
			badgelabel: false
		}
	}) );
	owner.register( "service:notification", Service.extend( NotificationServiceBadgeMixin ) );

	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	// doesn't update the label when not running or disabled in settings
	service.trigger( "streams-all", [ {}, {} ] );

	run( () => set( settings, "notification.badgelabel", true ) );

	// doesn't update the label when enabled, but not running
	service.trigger( "streams-all", [ {}, {} ] );

	run( () => set( service, "running", true ) );

	// updates the label when running and enabled
	expected = "2";
	service.trigger( "streams-all", [ {}, {} ] );
	expected = "3";
	service.trigger( "streams-all", [ {}, {}, {} ] );

	// clears label when it gets disabled
	expected = "";
	run( () => set( settings, "notification.badgelabel", false ) );

	// doesn't reset label, requires a new streams-all event
	run( () => set( settings, "notification.badgelabel", true ) );
	expected = "1";
	service.trigger( "streams-all", [ {} ] );

	// clears label when service stops
	expected = "";
	run( () => set( service, "running", false ) );

	runDestroy( owner );

});
