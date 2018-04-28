import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs, triggerKeyDown } from "test-utils";

import CheckBoxComponent from "ui/components/form/check-box/component";


moduleForComponent( "ui/components/form/check-box", {
	integration: true,
	resolver: buildResolver({
		CheckBoxComponent
	})
});


test( "CheckBoxComponent", function( assert ) {

	this.set( "checked", true );
	this.set( "disabled", false );
	this.render( hbs`{{#check-box checked=checked disabled=disabled}}foo{{/check-box}}` );
	const $elem = this.$( ".check-box-component" );

	assert.ok( $elem.get( 0 ) instanceof HTMLElement, "Component renders" );
	assert.strictEqual( $elem.text(), "foo", "Has a label" );
	assert.ok( $elem.hasClass( "checked" ), "Is checked initially" );

	// set to false in context
	this.set( "checked", false );
	assert.notOk( $elem.hasClass( "checked" ), "Is not checked anymore after binding has changed" );

	// toggle by clicking the CheckBoxComponent
	$elem.click();
	assert.ok( $elem.hasClass( "checked" ), "Clicking toggles checked state" );
	assert.ok( this.get( "checked" ), "Clicking also updated binding" );

	// disable CheckBoxComponent
	this.set( "disabled", true );
	assert.ok( $elem.hasClass( "disabled" ), "Is now disabled" );

	// try to click the disabled CheckBoxComponent
	$elem.click();
	assert.ok( $elem.hasClass( "checked" ), "Clicking while being disabled doesn't do anything" );
	assert.ok( this.get( "checked" ), "The binding also doesn't change" );

});


test( "CheckBoxComponent - without block", function( assert ) {

	this.set( "label", "foo" );
	this.render( hbs`{{check-box label}}` );
	const $elem = this.$( ".check-box-component" );

	assert.strictEqual( $elem.text(), "foo", "Has a label" );

	this.set( "label", "bar" );
	assert.strictEqual( $elem.text(), "bar", "Label gets updated" );

});


test( "Hotkeys", function( assert ) {

	let e;

	this.set( "checked", false );
	this.set( "disabled", false );
	this.render( hbs`{{check-box "foo" checked=checked disabled=disabled}}` );

	const $elem = this.$( ".check-box-component" );
	const document = $elem.get( 0 ).ownerDocument;

	assert.notStrictEqual( document.activeElement, $elem[0], "Is not focused initially" );
	assert.notOk( this.get( "checked" ), "Is not checked initially" );
	assert.strictEqual( $elem.attr( "tabindex" ), "0", "Has a tabindex attribute with value 0" );

	e = triggerKeyDown( $elem, "Space" );
	assert.notOk( this.get( "checked" ), "Is still not checked on Space" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	e = triggerKeyDown( $elem, "Space" );
	assert.ok( this.get( "checked" ), "Is checked on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
	e = triggerKeyDown( $elem, "Space" );
	assert.notOk( this.get( "checked" ), "Is not checked anymore on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

	triggerKeyDown( $elem, "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

	this.set( "disabled", true );
	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	e = triggerKeyDown( $elem, "Space" );
	assert.notOk( this.get( "checked" ), "Is not checked on Space while being disabled" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

	triggerKeyDown( $elem, "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

});
