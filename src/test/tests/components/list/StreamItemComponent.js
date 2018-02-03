import {
	module,
	test
} from "qunit";
import {
	buildOwner,
	runDestroy
} from "test-utils";
import {
	get,
	set
} from "@ember/object";
import Service from "@ember/service";
import StreamItemComponent from "components/list/StreamItemComponent";


// TODO: add proper tests (unit/integration) after merging the ember-upgrade branch (ember >= 2.10)
module( "components/list/StreamItemComponent", {
	beforeEach() {
		this.owner = buildOwner();
		this.owner.register( "service:settings", Service.extend() );
		this.owner.register( "component:stream-item", StreamItemComponent );
	},
	afterEach() {
		runDestroy( this.owner );
	}
});


test( "hasCustomLangFilter", function( assert ) {

	const settings = this.owner.lookup( "service:settings" );

	function setLanguages( languages ) {
		set( settings, "streams", {
			languages: { toJSON: () => languages }
		});
	}

	const subject = this.owner.lookup( "component:stream-item" );

	setLanguages( {} );
	assert.notOk( get( subject, "hasCustomLangFilter" ), "No filter is set" );

	setLanguages({
		a: true,
		b: true,
		c: true
	});
	assert.notOk( get( subject, "hasCustomLangFilter" ), "Doesn't have a custom lang filter" );

	setLanguages({
		a: false,
		b: false,
		c: false
	});
	assert.notOk( get( subject, "hasCustomLangFilter" ), "Doesn't have a custom lang filter" );

	setLanguages({
		a: true,
		b: true,
		c: false
	});
	assert.ok( get( subject, "hasCustomLangFilter" ), "Has a custom lang filter" );

	setLanguages({
		a: false,
		b: false,
		c: true
	});
	assert.ok( get( subject, "hasCustomLangFilter" ), "Has a custom lang filter" );

});
