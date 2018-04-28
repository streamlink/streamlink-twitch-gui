import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, runDestroy } from "test-utils";
import { A as EmberNativeArray } from "@ember/array";
import { set, setProperties } from "@ember/object";
import { run } from "@ember/runloop";
import $ from "jquery";
import sinon from "sinon";

import DropDownListComponent from "ui/components/form/drop-down-list/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


moduleForComponent( "drop-down-list", "ui/components/form/drop-down-list", {
	unit: true,
	needs: [ "helper:is-equal" ],
	resolver: buildResolver({
		DropDownListComponent,
		IsEqualHelper
	})
});


test( "Expand and collapse", function( assert ) {

	const subject = this.subject();
	const action = sinon.spy( subject.actions, "change" );
	const content = new EmberNativeArray([{
		id: 1,
		label: "foo"
	}, {
		id: 2,
		label: "bar"
	}, {
		id: 3,
		label: "baz"
	}]);

	setProperties( subject, {
		content,
		selection: content[1],
		optionValuePath: "id",
		optionLabelPath: "label"
	});

	this.render();

	let clickListener;
	const body = this._element.ownerDocument.body;
	const $list = this.$();

	const checkListener = ( event, listener ) => {
		const events = $._data( body, "events" );
		if ( events ) {
			const listeners = events[ event ];
			if ( listeners ) {
				return listeners.some( obj => obj.handler === listener );
			}
		}
		return false;
	};

	// initial state
	assert.notOk( $list.hasClass( "expanded" ), "Is not expanded initially" );
	assert.notOk( subject._clickListener, "Doesn't have a click listener" );

	// expand
	run( () => set( subject, "expanded", true ) );
	clickListener = subject._clickListener;
	assert.ok( $list.hasClass( "expanded" ), "List is expanded after clicking the selection" );
	assert.ok( clickListener, "Does have a click listener" );
	assert.ok(
		checkListener( "click", clickListener ),
		"Has a click listener registered on the document body"
	);

	// collapse by clicking an item
	run( () => this.$( "li" ).eq( 1 ).click() );
	assert.strictEqual( action.args[0][0], content[1], "Passes second item as click action param" );
	assert.notOk( $list.hasClass( "expanded" ), "List collapsed after clicking an item" );
	assert.notOk( subject._clickListener, "Doesn't have a click listener anymore" );
	assert.notOk(
		checkListener( "click", clickListener ),
		"Old click listener is not registered on the document body anymore as well"
	);

	// collapse by clicking an external node
	run( () => set( subject, "expanded", true ) );
	clickListener = subject._clickListener;
	assert.ok( $list.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( clickListener, "Does have a click listener" );
	assert.ok(
		checkListener( "click", clickListener ),
		"Has a click listener registered on the document body"
	);

	run( () => $( body ).click() );
	assert.notOk( $list.hasClass( "expanded" ), "List collapsed after clicking the document body" );
	assert.notOk( subject._clickListener, "Doesn't have a click listener anymore" );
	assert.notOk(
		checkListener( "click", clickListener ),
		"Old click listener is not registered on the document body anymore as well"
	);

	// component destruction
	run( () => set( subject, "expanded", true ) );
	clickListener = subject._clickListener;
	assert.ok( $list.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( clickListener, "Does have a click listener" );
	assert.ok(
		checkListener( "click", clickListener ),
		"Has a click listener registered on the document body"
	);
	runDestroy( subject );
	assert.notOk( subject._clickListener, "Removes click listener on destruction" );
	assert.notOk(
		checkListener( "click", clickListener ),
		"Old click listener is not registered on the document body anymore as well"
	);

});
