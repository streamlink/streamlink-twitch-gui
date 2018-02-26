import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import { A as EmberNativeArray } from "@ember/array";
import { get, set } from "@ember/object";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import notificationServiceTrayMixinInjector
	from "inject-loader?nwjs/Tray!services/NotificationService/tray";


module( "services/NotificationService/tray" );


test( "Tray menu item", assert => {

	let items = new EmberNativeArray();

	// stub NWjs behavior
	const click = item => {
		item.checked = !item.checked;
		item.click( item );
	};

	const { default: NotificationServiceTrayMixin } = notificationServiceTrayMixinInjector({
		"nwjs/Tray": {
			getMenu() {
				return { items };
			}
		}
	});

	const owner = buildOwner();
	owner.register( "service:notification", Service.extend( NotificationServiceTrayMixin ) );

	const service = owner.lookup( "service:notification" );
	assert.strictEqual( get( service, "_trayMenuItem" ), null, "Doesn't create an item initially" );

	// enable
	run( () => set( service, "enabled", true ) );
	assert.propEqual(
		items.toArray(),
		[{
			type   : "checkbox",
			label  : "Pause notifications",
			tooltip: "Quickly toggle desktop notifications",
			checked: false,
			click  : () => {}
		}],
		"Creates a new menu item"
	);
	assert.strictEqual( get( service, "_trayMenuItem" ), items[0], "Caches the menu item" );

	// click
	assert.strictEqual( get( service, "paused" ), false, "Is not paused initially" );
	click( items[0] );
	assert.strictEqual( get( service, "paused" ), true, "Is paused after clicking once" );
	click( items[0] );
	assert.strictEqual( get( service, "paused" ), false, "Is not paused after clicking twice" );
	click( items[0] );
	assert.strictEqual( get( service, "paused" ), true, "Is paused again" );

	// disable
	run( () => set( service, "enabled", false ) );
	assert.propEqual( items.toArray(), [], "Removes the menu item" );
	assert.strictEqual( get( service, "_trayMenuItem" ), null, "Removes menu item from cache" );
	assert.strictEqual( get( service, "paused" ), false, "Is not paused anymore" );

	runDestroy( owner );

});
