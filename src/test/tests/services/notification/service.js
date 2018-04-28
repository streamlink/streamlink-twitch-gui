import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { I18nService } from "i18n-utils";
import { get, set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import notificationServiceInjector
	from "inject-loader?./polling&./dispatch&./badge&./tray&./follow!services/notification/service";


module( "services/notification" );


test( "NotificationService", assert => {

	const owner = buildOwner();

	const { default: NotificationService } = notificationServiceInjector({
		"./polling": {},
		"./dispatch": {},
		"./badge": {},
		"./tray": {},
		"./follow": {}
	});

	owner.register( "service:auth", Service.extend({
		session: {
			isLoggedIn: false
		}
	}) );
	owner.register( "service:i18n", I18nService );
	owner.register( "service:settings", Service.extend({
		notification: {
			enabled: false
		}
	}) );
	owner.register( "service:notification", NotificationService );

	const auth = owner.lookup( "service:auth" );
	const settings = owner.lookup( "service:settings" );
	const service = owner.lookup( "service:notification" );

	assert.notOk( get( service, "error" ), "Error flag is not set" );
	assert.notOk( get( service, "enabled" ), "Is not enabled" );
	assert.notOk( get( service, "paused" ), "Is not paused" );
	assert.notOk( get( service, "running" ), "Is not running when being logged out or disabled" );
	assert.strictEqual( get( service, "statusText" ), "services.notification.status.disabled" );

	run( () => set( settings, "notification.enabled", true ) );
	assert.notOk( get( service, "running" ), "Is not running when being logged out and enabled" );

	run( () => set( auth, "session.isLoggedIn", true ) );
	assert.ok( get( service, "running" ), "Is running when being logged in and enabled" );
	assert.strictEqual( get( service, "statusText" ), "services.notification.status.enabled" );

	run( () => set( service, "error", true ) );
	assert.strictEqual( get( service, "statusText" ), "services.notification.status.error" );

	run( () => set( service, "paused", true ) );
	assert.notOk( get( service, "running" ), "Is not running when paused" );
	assert.strictEqual( get( service, "statusText" ), "services.notification.status.paused" );

	run( () => set( settings, "notification.enabled", false ) );
	assert.notOk( get( service, "running" ), "Is not running when being logged in and disabled" );
	run( () => set( service, "paused", false ) );
	assert.notOk( get( service, "running" ), "Still not running when unpausing again" );

	runDestroy( owner );

});
