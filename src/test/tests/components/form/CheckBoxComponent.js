import {
	moduleForComponent,
	test
} from "ember-qunit";
import {
	buildResolver,
	hbs
} from "test-utils";
import $ from "jquery";
import HotkeyService from "services/HotkeyService";
import CheckBoxComponent from "components/form/CheckBoxComponent";


moduleForComponent( "components/form/CheckBoxComponent", {
	integration: true,
	resolver: buildResolver({
		CheckBoxComponent,
		HotkeyService
	}),
	beforeEach() {
		this.inject.service( "hotkey" );
	}
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

	let event;
	const hotkeyService = this.container.lookup( "service:hotkey" );

	function trigger( code ) {
		const event = $.Event( "keyup" );
		event.code = code;
		hotkeyService.trigger( event );
		return event;
	}

	this.set( "checked", false );
	this.set( "disabled", false );
	this.render( hbs`{{check-box "foo" checked=checked disabled=disabled}}` );

	const $elem = this.$( ".check-box-component" );
	const document = $elem.get( 0 ).ownerDocument;

	assert.notStrictEqual( document.activeElement, $elem[0], "Is not focused initially" );
	assert.notOk( this.get( "checked" ), "Is not checked initially" );
	assert.strictEqual( $elem.attr( "tabindex" ), "0", "Has a tabindex attribute with value 0" );

	event = trigger( "Space" );
	assert.notOk( this.get( "checked" ), "Is still not checked on Space" );
	assert.notOk( event.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( event.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	event = trigger( "Space" );
	assert.ok( this.get( "checked" ), "Is checked on Space" );
	assert.ok( event.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( event.isImmediatePropagationStopped(), "Stops event's propagation" );
	event = trigger( "Space" );
	assert.notOk( this.get( "checked" ), "Is not checked anymore on Space" );
	assert.ok( event.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( event.isImmediatePropagationStopped(), "Stops event's propagation" );

	trigger( "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

	this.set( "disabled", true );
	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	event = trigger( "Space" );
	assert.notOk( this.get( "checked" ), "Is not checked on Space while being disabled" );
	assert.notOk( event.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( event.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	trigger( "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

});
