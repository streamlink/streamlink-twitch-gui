import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isPropagationStopped,
	triggerKeyDownEvent
} from "event-utils";
import { render, click, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import CheckBoxComponent from "ui/components/form/check-box/component";


module( "ui/components/form/check-box", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			CheckBoxComponent
		})
	});

	stubDOMEvents( hooks );


	test( "CheckBoxComponent", async function( assert ) {
		this.setProperties({
			checked: true,
			disabled: false
		});
		await render( hbs`
			{{#check-box checked=checked disabled=disabled}}foo{{/check-box}}
		` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.ok( elem instanceof HTMLElement, "Component renders" );
		assert.strictEqual( elem.innerText, "foo", "Has a label" );
		assert.notOk( elem.classList.contains( "no-label" ), "Doesn't have the no-label class" );
		assert.ok( elem.classList.contains( "checked" ), "Is checked initially" );

		// set to false in context
		this.set( "checked", false );
		assert.notOk(
			elem.classList.contains( "checked" ),
			"Is not checked anymore on binding change"
		);

		// toggle by clicking the CheckBoxComponent
		await click( elem );
		assert.ok( elem.classList.contains( "checked" ), "Clicking toggles checked state" );
		assert.ok( this.get( "checked" ), "Clicking also updated binding" );

		// disable CheckBoxComponent
		this.set( "disabled", true );
		assert.ok( elem.classList.contains( "disabled" ), "Is now disabled" );

		// try to click the disabled CheckBoxComponent
		await click( elem );
		assert.ok( elem.classList.contains( "checked" ), "No click action while being disabled" );
		assert.ok( this.get( "checked" ), "The binding also doesn't change" );
	});


	test( "Positional parameters", async function( assert ) {
		this.set( "label", "foo" );
		this.set( "description", "" );
		await render( hbs`{{check-box label description}}` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.notOk( elem.classList.contains( "no-label" ), "Doesn't have the no-label class" );
		assert.propEqual(
			Array.from( elem.querySelector( ":scope > div" ).children ).map( e => e.innerText ),
			[ "foo" ],
			"Has a label, but no description"
		);

		this.set( "label", "bar" );
		assert.propEqual(
			Array.from( elem.querySelector( ":scope > div" ).children ).map( e => e.innerText ),
			[ "bar" ],
			"Label gets updated"
		);

		this.set( "description", "baz" );
		assert.propEqual(
			Array.from( elem.querySelector( ":scope > div" ).children ).map( e => e.innerText ),
			[ "bar", "baz" ],
			"Has a label and a description"
		);
	});


	test( "Inverse block", async function( assert ) {
		await render( hbs`{{#check-box}}foo{{else}}bar{{/check-box}}` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.propEqual(
			Array.from( elem.querySelector( ":scope > div" ).children ).map( e => e.innerText ),
			[ "foo", "bar" ],
			"Has a label and a description"
		);
	});


	test( "No block and label", async function( assert ) {
		await render( hbs`{{check-box}}` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.strictEqual( elem.innerText, "", "Doesn't have a label" );
		assert.ok( elem.classList.contains( "no-label" ), "Has the no-label class" );
		assert.notOk( elem.querySelector( ":scope > div" ), "Doesn't have a label element" );
	});


	test( "Attribute bindings", async function( assert ) {
		await render( hbs`{{check-box title="foo"}}` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.strictEqual( elem.getAttribute( "tabindex" ), "0", "Has the tabindex of 0" );
		assert.strictEqual( elem.getAttribute( "title" ), "foo", "Has a title" );
	});


	test( "Hotkeys", async function( assert ) {
		let e;

		this.setProperties({
			checked: false,
			disabled: false
		});
		await render( hbs`{{check-box "foo" checked=checked disabled=disabled}}` );

		const elem = this.element.querySelector( ".check-box-component" );
		const document = elem.ownerDocument;

		assert.notStrictEqual( document.activeElement, elem, "Is not focused initially" );
		assert.notOk( this.get( "checked" ), "Is not checked initially" );

		e = await triggerKeyDownEvent( elem, " " );
		assert.notOk( this.get( "checked" ), "Is still not checked on Space" );
		assert.notOk( isDefaultPrevented( e ), "Doesn't prevent event's default action" );
		assert.notOk( isPropagationStopped( e ), "Doesn't stop event's propagation" );

		await focus( elem );
		assert.strictEqual( document.activeElement, elem, "Is focused now" );

		e = await triggerKeyDownEvent( elem, " " );
		assert.ok( this.get( "checked" ), "Is checked on Space" );
		assert.ok( isDefaultPrevented( e ), "Prevents event's default action" );
		assert.ok( isPropagationStopped( e ), "Stops event's propagation" );
		e = await triggerKeyDownEvent( elem, " " );
		assert.notOk( this.get( "checked" ), "Is not checked anymore on Space" );
		assert.ok( isDefaultPrevented( e ), "Prevents event's default action" );
		assert.ok( isPropagationStopped( e ), "Stops event's propagation" );

		await triggerKeyDownEvent( elem, "Escape" );
		assert.notStrictEqual( document.activeElement, elem, "Removes focus on Escape" );

		this.set( "disabled", true );
		await focus( elem );
		assert.strictEqual( document.activeElement, elem, "Is focused now" );

		e = await triggerKeyDownEvent( elem, " " );
		assert.notOk( this.get( "checked" ), "Is not checked on Space while being disabled" );
		assert.notOk( isDefaultPrevented( e ), "Doesn't prevent event's default action" );
		assert.notOk( isPropagationStopped( e ), "Doesn't stop event's propagation" );

		await triggerKeyDownEvent( elem, "Escape" );
		assert.notStrictEqual( document.activeElement, elem, "Removes focus on Escape" );
	});

});
