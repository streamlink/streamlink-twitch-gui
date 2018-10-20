import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
// TODO: use triggerKeyEvent of @ember/test-helpers once the event gets returned
import { buildResolver, triggerKeyDown } from "test-utils";
import { render, click, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import CheckBoxComponent from "ui/components/form/check-box/component";


module( "ui/components/form/check-box", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			CheckBoxComponent
		})
	});


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


	test( "CheckBoxComponent - without block", async function( assert ) {
		this.set( "label", "foo" );
		await render( hbs`{{check-box label}}` );
		const elem = this.element.querySelector( ".check-box-component" );

		assert.strictEqual( elem.innerText, "foo", "Has a label" );

		this.set( "label", "bar" );
		assert.strictEqual( elem.innerText, "bar", "Label gets updated" );
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
		assert.strictEqual( elem.getAttribute( "tabindex" ), "0", "Tabindex attribute is 0" );

		e = triggerKeyDown( elem, "Space" );
		assert.notOk( this.get( "checked" ), "Is still not checked on Space" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

		await focus( elem );
		assert.strictEqual( document.activeElement, elem, "Is focused now" );

		e = triggerKeyDown( elem, "Space" );
		assert.ok( this.get( "checked" ), "Is checked on Space" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
		e = triggerKeyDown( elem, "Space" );
		assert.notOk( this.get( "checked" ), "Is not checked anymore on Space" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

		triggerKeyDown( elem, "Escape" );
		assert.notStrictEqual( document.activeElement, elem, "Removes focus on Escape" );

		this.set( "disabled", true );
		await focus( elem );
		assert.strictEqual( document.activeElement, elem, "Is focused now" );

		e = triggerKeyDown( elem, "Space" );
		assert.notOk( this.get( "checked" ), "Is not checked on Space while being disabled" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

		triggerKeyDown( elem, "Escape" );
		assert.notStrictEqual( document.activeElement, elem, "Removes focus on Escape" );
	});

});
