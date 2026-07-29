import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeIntlService } from "intl-utils";

import { set } from "@ember/object";
import Service from "@ember/service";

import notificationServiceInjector
	from "inject-loader?./polling&./dispatch&./badge&./tray!services/notification/service";


module( "services/notification", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService
		})
	});

	hooks.beforeEach(function() {
		const { default: NotificationService } = notificationServiceInjector({
			"./polling": {},
			"./dispatch": {},
			"./badge": {},
			"./tray": {}
		});

		this.owner.register( "service:notification", NotificationService );
		this.owner.register( "service:auth", Service.extend({
			session: {
				isLoggedIn: false
			}
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				notification: {
					enabled: false
				}
			}
		}) );
	});

	test( "NotificationService", function( assert ) {
		/** @type {NotificationService} */
		const service = this.owner.lookup( "service:notification" );

		assert.notOk( service.error, "Error flag is not set" );
		assert.notOk( service.enabled, "Is not enabled" );
		assert.notOk( service.paused, "Is not paused" );
		assert.notOk( service.running, "Is not running when being logged out or disabled" );
		assert.strictEqual( service.statusText, "services.notification.status.disabled" );

		set( service, "settings.content.notification.enabled", true );
		assert.notOk( service.running, "Is not running when being logged out and enabled" );

		set( service, "auth.session.isLoggedIn", true );
		assert.ok( service.running, "Is running when being logged in and enabled" );
		assert.strictEqual( service.statusText, "services.notification.status.enabled" );

		set( service, "error", true );
		assert.strictEqual( service.statusText, "services.notification.status.error" );

		set( service, "paused", true );
		assert.notOk( service.running, "Is not running when paused" );
		assert.strictEqual( service.statusText, "services.notification.status.paused" );

		set( service, "settings.content.notification.enabled", false );
		assert.notOk( service.running, "Is not running when being logged in and disabled" );
		set( service, "paused", false );
		assert.notOk( service.running, "Still not running when unpausing again" );
	});
});
