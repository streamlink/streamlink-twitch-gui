import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver, runDestroy } from "test-utils";

import { A as EmberNativeArray } from "@ember/array";
import { set } from "@ember/object";

import SelectableComponent from "ui/components/form/-selectable/component";


module( "ui/components/form/-selectable", function( hooks ) {
	setupTest( hooks, {
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

		const Subject = this.owner.factoryFor( "component:-selectable" );
		const subject = Subject.create({
			content,
			value: 2,
			optionValuePath: "data"
		});

		// initial selection
		assert.strictEqual( subject.selection, content[1], "Initial selection" );

		// set selection
		set( subject, "selection", content[0] );
		assert.strictEqual( subject.value, 1, "Changes value on selection change" );

		// set matching value
		set( subject, "value", 3 );
		assert.strictEqual( subject.selection, content[2], "Finds selection by value" );

		// remove current selection from content list
		content.removeAt( 2 );
		assert.strictEqual( subject.value, null, "Value is null if selection gets removed" );
		assert.strictEqual( subject.selection, null, "Selection is null as well" );

		// check whether the old selection value observer has been removed
		set( dataThree, "data", 123 );
		assert.strictEqual( subject.value, null, "Old selection observer hass been removed" );
		assert.strictEqual( subject.selection, null, "Selection is still null" );

		// set non-matching value
		set( subject, "value", 4 );
		assert.strictEqual( subject.selection, null, "Selection is null on unknown value" );

		// add content
		content.addObject( dataFour );
		assert.strictEqual( subject.selection, dataFour, "Finds new selection" );

		// change selection's value property
		set( dataFour, "data", 4444 );
		assert.strictEqual( subject.selection, dataFour, "No new selection on value change" );
		assert.strictEqual( subject.value, 4444, "Value has been updated" );

		runDestroy( subject );
		assert.notOk( subject._selection, "Removes selection cache on destruction" );
		assert.notOk( subject._selectionValueObserver, "Removes selection value observer as well" );
	});

});
