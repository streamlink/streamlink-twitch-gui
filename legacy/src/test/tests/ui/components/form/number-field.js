import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { blur } from "event-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { run } from "@ember/runloop";

import NumberFieldComponent from "ui/components/form/number-field/component";


module( "ui/components/form/number-field", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			NumberFieldComponent
		})
	});


	test( "Values and number types", async function( assert ) {
		this.set( "value", 123 );
		await render( hbs`{{number-field value=value}}` );
		const input = this.element.querySelector( ".number-field-component > input" );

		assert.strictEqual( input.value, "123", "The input element has a value" );

		this.set( "value", 100 );
		assert.strictEqual( input.value, "100", "Changing the value directly" );

		run( () => input.value = "0" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 0, "Changing the value via the input field" );
	});


	test( "Average value", async function( assert ) {
		await render( hbs`{{number-field value=value min=10 max=20}}` );
		const input = this.element.querySelector( ".number-field-component > input" );

		assert.strictEqual( input.value, "15", "Undefined value" );

		run( () => input.value = "invalid" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 15, "Invalid input value" );
	});


	test( "Default value", async function( assert ) {
		await render( hbs`{{number-field value=value defaultValue=123}}` );
		const input = this.element.querySelector( ".number-field-component > input" );

		assert.strictEqual( input.value, "123", "Undefined value" );

		run( () => input.value = "invalid" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 123, "Invalid input value" );
	});


	test( "Previous value", async function( assert ) {
		this.set( "value", 100 );
		await render( hbs`{{number-field value=value}}` );
		const input = this.element.querySelector( ".number-field-component > input" );

		run( () => input.value = "123" );
		await blur( input );
		run( () => input.value = "invalid" );
		await blur( input );
		assert.strictEqual( input.value, "123", "Updates input field value on invalid input" );
		assert.strictEqual( this.get( "value" ), 123, "Updates component value as well" );
	});


	test( "Increase and decrease buttons", async function( assert ) {
		this.set( "value", 0 );
		await render( hbs`{{number-field value=value}}` );
		const elem = this.element.querySelector( ".number-field-component" );

		await click( elem.querySelector( ".spin-button-increase" ) );
		assert.strictEqual( this.get( "value" ), 1, "Increase button increases value by one" );

		await click( elem.querySelector( ".spin-button-decrease" ) );
		assert.strictEqual( this.get( "value" ), 0, "Decrease button decreases value by one" );
	});


	test( "Disabled state", async function( assert ) {
		this.set( "value", 0 );
		await render( hbs`{{number-field value=value disabled=true}}` );
		const elem = this.element.querySelector( ".number-field-component" );
		const input = elem.querySelector( "input" );

		await click( elem.querySelector( ".spin-button-increase" ) );
		assert.strictEqual( this.get( "value" ), 0, "Can't increase values if disabled" );

		await click( elem.querySelector( ".spin-button-decrease" ) );
		assert.strictEqual( this.get( "value" ), 0, "Can't decrease values if disabled" );

		run( () => input.value = "123" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 0, "Can't change values if disabled" );
	});


	test( "Min/max values", async function( assert ) {
		this.set( "value", 2 );
		await render( hbs`{{number-field value=value min=1 max=3}}` );
		const elem = this.element.querySelector( ".number-field-component" );
		const input = elem.querySelector( "input" );

		run( () => input.value = "4" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 3, "Can't set values above the defined maximum" );

		run( () => input.value = "0" );
		await blur( input );
		assert.strictEqual( this.get( "value" ), 1, "Can't set values below the defined minimum" );

		this.set( "value", 3 );
		await click( elem.querySelector( ".spin-button-increase" ) );
		assert.strictEqual( this.get( "value" ), 3, "The increase button respects the maximum" );

		this.set( "value", 1 );
		await click( elem.querySelector( ".spin-button-decrease" ) );
		assert.strictEqual( this.get( "value" ), 1, "The decrease button respects the minimum" );
	});

});
