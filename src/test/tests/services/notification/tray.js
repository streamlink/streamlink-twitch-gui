import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";

import { A as EmberNativeArray } from "@ember/array";
import { set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import NotificationServiceTrayMixin from "services/notification/tray";


module( "services/notification/tray", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			NotificationService: Service.extend( NotificationServiceTrayMixin )
		})
	});

	hooks.beforeEach(function() {
		this.items = new EmberNativeArray();
		this.owner.register( "service:nwjs", Service.extend({
			addTrayMenuItem: item => this.items.unshiftObject( item ),
			removeTrayMenuItem: item => this.items.removeObject( item )
		}) );
	});


	test( "Tray menu item", async function( assert ) {
		// stub NWjs behavior
		const click = item => {
			item.checked = !item.checked;
			item.click( item );
		};

		const service = this.owner.lookup( "service:notification" );
		assert.strictEqual( service._trayMenuItem, null, "Doesn't create an item initially" );

		// enable
		run( () => set( service, "enabled", true ) );
		assert.propEqual(
			this.items.toArray(),
			[{
				type   : "checkbox",
				label  : [ "services.notification.tray.pause.label" ],
				tooltip: [ "services.notification.tray.pause.tooltip" ],
				checked: false,
				click  : () => {}
			}],
			"Creates a new tray icon context menu item"
		);
		assert.strictEqual( service._trayMenuItem, this.items[0], "Caches the menu item" );

		// click
		assert.strictEqual( service.paused, false, "Is not paused initially" );
		click( this.items[0] );
		assert.strictEqual( service.paused, true, "Is paused after clicking once" );
		click( this.items[0] );
		assert.strictEqual( service.paused, false, "Is not paused after clicking twice" );
		click( this.items[0] );
		assert.strictEqual( service.paused, true, "Is paused again" );

		// disable
		run( () => set( service, "enabled", false ) );
		assert.propEqual( this.items.toArray(), [], "Removes the menu item" );
		assert.strictEqual( service._trayMenuItem, null, "Removes menu item from cache" );
		assert.strictEqual( service.paused, false, "Is not paused anymore" );
	});

});
