import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { run } from "@ember/runloop";

import NumberFieldComponent from "ui/components/form/number-field/component";


moduleForComponent( "ui/components/form/number-field", {
	integration: true,
	resolver: buildResolver({
		NumberFieldComponent
	})
});


test( "Values and number types", function( assert ) {

	this.set( "value", 123 );
	this.render( hbs`{{number-field value=value}}` );
	const $input = this.$( ".number-field-component > input" );

	assert.strictEqual( $input.val(), "123", "The input element has a value" );

	this.set( "value", 100 );
	assert.strictEqual( $input.val(), "100", "Changing the value directly" );

	run( () => {
		$input.val( "0" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 0, "Changing the value via the input field" );

});


test( "Average value", function( assert ) {

	this.render( hbs`{{number-field value=value min=10 max=20}}` );
	const $input = this.$( ".number-field-component > input" );

	assert.strictEqual( $input.val(), "15", "Undefined value" );

	run( () => {
		$input.val( "invalid" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 15, "Invalid input value" );

});


test( "Default value", function( assert ) {

	this.render( hbs`{{number-field value=value defaultValue=123}}` );
	const $input = this.$( ".number-field-component > input" );

	assert.strictEqual( $input.val(), "123", "Undefined value" );

	run( () => {
		$input.val( "invalid" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 123, "Invalid input value" );

});


test( "Previous value", function( assert ) {

	this.set( "value", 100 );
	this.render( hbs`{{number-field value=value}}` );
	const $input = this.$( ".number-field-component > input" );

	run( () => {
		$input.val( "123" );
		$input.blur();
	});
	run( () => {
		$input.val( "invalid" );
		$input.blur();
	});
	assert.strictEqual( $input.val(), "123", "Updates input field value on invalid user input" );
	assert.strictEqual( this.get( "value" ), 123, "Updates component value as well" );

});


test( "Increase and decrease buttons", function( assert ) {

	this.set( "value", 0 );
	this.render( hbs`{{number-field value=value}}` );
	const $elem = this.$( ".number-field-component" );

	run( () => $elem.find( ".spin-button-increase" ).click() );
	assert.strictEqual( this.get( "value" ), 1, "Increase button click increases value by one" );

	run( () => $elem.find( ".spin-button-decrease" ).click() );
	assert.strictEqual( this.get( "value" ), 0, "Decrease button click decreases value by one" );

});


test( "Disabled state", function( assert ) {

	this.set( "value", 0 );
	this.render( hbs`{{number-field value=value disabled=true}}` );
	const $elem = this.$( ".number-field-component" );
	const $input = $elem.find( "input" );

	run( () => $elem.find( ".spin-button-increase" ).click() );
	assert.strictEqual( this.get( "value" ), 0, "Can't increase values of disabled number fields" );

	run( () => $elem.find( ".spin-button-decrease" ).click() );
	assert.strictEqual( this.get( "value" ), 0, "Can't decrease values of disabled number fields" );

	run( () => {
		$input.val( "123" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 0, "Can't change values of disabled number fields" );

});


test( "Min/max values", function( assert ) {

	this.set( "value", 2 );
	this.render( hbs`{{number-field value=value min=1 max=3}}` );
	const $elem = this.$( ".number-field-component" );
	const $input = $elem.find( "input" );

	run( () => {
		$input.val( "4" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 3, "Can't set values above the defined maximum" );

	run( () => {
		$input.val( "0" );
		$input.blur();
	});
	assert.strictEqual( this.get( "value" ), 1, "Can't set values below the defined minimum" );

	this.set( "value", 3 );
	run( () => $elem.find( ".spin-button-increase" ).click() );
	assert.strictEqual( this.get( "value" ), 3, "The increase button respects the maximum" );

	this.set( "value", 1 );
	run( () => $elem.find( ".spin-button-decrease" ).click() );
	assert.strictEqual( this.get( "value" ), 1, "The decrease button respects the minimum" );

});
