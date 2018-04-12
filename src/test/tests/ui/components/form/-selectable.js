import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, runDestroy } from "test-utils";
import { A as EmberNativeArray } from "@ember/array";
import { get, set } from "@ember/object";

import SelectableComponent from "ui/components/form/-selectable/component";


moduleForComponent( "selectable", "ui/components/form/-selectable", {
	unit: true,
	resolver: buildResolver({
		SelectableComponent
	})
});


test( "Value attribute binding", function( assert ) {

	const dataOne = {
		data: 1,
		label: "foo"
	};
	const dataTwo = {
		data: 2,
		label: "bar"
	};
	const dataThree = {
		data: 3,
		label: "baz"
	};
	const dataFour = {
		data: 4,
		label: "qux"
	};
	const content = new EmberNativeArray([ dataOne, dataTwo, dataThree ]);

	const subject = this.subject({
		content,
		value: 2,
		optionValuePath: "data"
	});

	// initial selection
	assert.strictEqual( get( subject, "selection" ), content[1], "Initial selection" );

	// set selection
	set( subject, "selection", content[0] );
	assert.strictEqual( get( subject, "value" ), 1, "Changes value on selection change" );

	// set matching value
	set( subject, "value", 3 );
	assert.strictEqual( get( subject, "selection" ), content[2], "Finds selection by value" );

	// remove current selection from content list
	content.removeAt( 2 );
	assert.strictEqual( get( subject, "value" ), null, "Value is null if selection gets removed" );
	assert.strictEqual( get( subject, "selection" ), null, "Selection is null as well" );

	// check whether the old selection value observer has been removed
	set( dataThree, "data", 123 );
	assert.strictEqual( get( subject, "value" ), null, "Old selection observer hass been removed" );
	assert.strictEqual( get( subject, "selection" ), null, "Selection is still null" );

	// set non-matching value
	set( subject, "value", 4 );
	assert.strictEqual( get( subject, "selection" ), null, "Selection is null on unknown value" );

	// add content
	content.addObject( dataFour );
	assert.strictEqual( get( subject, "selection" ), dataFour, "Finds new selection" );

	// change selection's value property
	set( dataFour, "data", 4444 );
	assert.strictEqual( get( subject, "selection" ), dataFour, "No new selection on value change" );
	assert.strictEqual( get( subject, "value" ), 4444, "Value has been updated" );

	runDestroy( subject );
	assert.notOk( subject._selection, "Removes selection cache on destruction" );
	assert.notOk( subject._selectionValueObserver, "Removes selection value observer as well" );

});
