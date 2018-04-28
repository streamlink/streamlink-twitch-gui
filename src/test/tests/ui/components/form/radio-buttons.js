import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs, triggerKeyDown } from "test-utils";
import { run } from "@ember/runloop";
import $ from "jquery";

import RadioButtonsComponent from "ui/components/form/radio-buttons/component";
import RadioButtonsItemComponent from "ui/components/form/radio-buttons-item/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


moduleForComponent( "ui/components/form/radio-buttons", {
	integration: true,
	resolver: buildResolver({
		RadioButtonsComponent,
		RadioButtonsItemComponent,
		IsEqualHelper
	}),
	beforeEach() {
		this.getItems = () => this.$( ".radio-buttons-item-component" );
		this.getLabels = () => this.getItems()
			.toArray()
			.map( item => $( item ).text().trim() );
		this.getChecked = () => this.getItems()
			.toArray()
			.map( item => $( item ).hasClass( "checked" ) );
		this.getDisabled = () => this.getItems()
			.toArray()
			.map( item => $( item ).hasClass( "disabled" ) );
	}
});


test( "DOM nodes, selection and labels", function( assert ) {

	const content = [{
		label: "foo",
		anotherLabel: "FOO"
	}, {
		label: "bar",
		anotherLabel: "BAR"
	}, {
		label: "baz",
		anotherLabel: "BAZ"
	}];

	this.setProperties({
		content,
		selection: content[1],
		optionLabelPath: "label"
	});

	this.render( hbs`
		{{radio-buttons
			content=content
			selection=selection
			optionLabelPath=optionLabelPath
		}}
	` );
	const $elem = this.$( ".radio-buttons-component" );
	const $elems = this.$( ".radio-buttons-item-component" );

	assert.ok( $elem.get( 0 ) instanceof HTMLElement, "Component renders" );
	assert.propEqual( this.getLabels(), [ "foo", "bar", "baz" ], "Sets initial item labels" );
	assert.propEqual( this.getChecked(), [ false, true, false ], "Sets initial item selection" );
	assert.propEqual( this.getDisabled(), [ false, false, false ], "Sets initial disabled states" );

	// unset selection (unknown selection)
	this.set( "selection", null );
	assert.propEqual( this.getChecked(), [ false, false, false ], "No item is selected" );

	// set a matching selection
	this.set( "selection", content[2] );
	assert.propEqual( this.getChecked(), [ false, false, true ], "Updates item selection" );

	// click the first list item
	run( () => this.getItems().eq( 0 ).click() );
	assert.strictEqual( this.get( "selection" ), content[0], "Updates selection on change" );
	assert.propEqual( this.getChecked(), [ true, false, false ], "Updates item selections" );

	// disable the third item
	this.set( "content.2.disabled", true );
	assert.propEqual( this.getDisabled(), [ false, false, true ], "Disables third item" );

	// try to click the disabled item
	run( () => $elems.eq( 2 ).click() );
	assert.strictEqual( this.get( "selection" ), content[0], "Can't click disabled items" );
	assert.propEqual( this.getChecked(), [ true, false, false ], "Selection stays the same" );

	// change the optionLabelPath
	this.set( "optionLabelPath", "anotherLabel" );
	assert.propEqual( this.getLabels(), [ "FOO", "BAR", "BAZ" ], "optionLabelPath changes labels" );

});


test( "Custom component and child-component blocks", function( assert ) {

	const content = [{
		id: 1,
		label: "foo",
		disabled: true
	}, {
		id: 2,
		label: "bar"
	}];

	this.setProperties({
		content,
		selection: content[1]
	});

	this.render( hbs`
		{{#radio-buttons content=content selection=selection as |rb|}}
			{{#rb.button}}
				{{rb.label}}: {{rb.value}} ({{if rb.checked 'y' 'n'}} - {{if rb.disabled 'y' 'n'}})
			{{/rb.button}}
		{{/radio-buttons}}
	` );

	assert.propEqual( this.getLabels(), [ "foo: 1 (n - y)", "bar: 2 (y - n)" ], "Custom labels" );
	assert.propEqual( this.getChecked(), [ false, true ], "Items have correct checked states" );
	assert.propEqual( this.getDisabled(), [ true, false ], "items have correct disabled states" );

});


test( "Hotkeys", function( assert ) {

	let e;

	const content = [{
		id: 1,
		label: "foo"
	}, {
		id: 2,
		label: "bar"
	}];

	this.setProperties({
		content,
		selection: content[0]
	});
	this.render( hbs`{{radio-buttons content=content selection=selection}}` );

	const $elems = this.$( ".radio-buttons-item-component" );
	const $elemTwo = $elems.eq( 1 );

	assert.propEqual(
		$elems.toArray().map( elem => $( elem ).attr( "tabindex" ) ),
		[ "0", "0" ],
		"All items have a tabindex attribute with value 0"
	);

	e = triggerKeyDown( $elemTwo, "Space" );
	assert.strictEqual( this.get( "selection" ), content[0], "Ignores Space if not focused" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

	$elemTwo.focus();
	assert.strictEqual( document.activeElement, $elemTwo.get( 0 ), "Second item is now focused" );

	e = triggerKeyDown( $elemTwo, "Space" );
	assert.strictEqual( this.get( "selection" ), content[1], "Changes selection if focused" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
	e = triggerKeyDown( $elemTwo, "Space" );
	assert.strictEqual( this.get( "selection" ), content[1], "Keeps selection" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

	triggerKeyDown( $elemTwo, "Escape" );
	assert.notStrictEqual( document.activeElement, $elemTwo.get( 0 ), "Removes focus on Escape" );

});
