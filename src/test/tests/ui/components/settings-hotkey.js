import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { setupKeyboardLayoutMap } from "keyboard-layout-map";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isImmediatePropagationStopped,
	triggerEvent,
	blur
} from "event-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Evented from "@ember/object/evented";
import Service from "@ember/service";
import { run } from "@ember/runloop";

import SettingsHotkeyComponent from "ui/components/settings-hotkey/component";
import FormButtonComponent from "ui/components/button/form-button/component";
import CheckBoxComponent from "ui/components/form/check-box/component";
import hotkeyServiceInjector from "inject-loader?config!services/hotkey";
import { helper as BoolOrHelper } from "ui/components/helper/bool-or";
import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";
import ObjectBuffer from "utils/ember/ObjectBuffer";


module( "ui/components/settings-hotkey", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			SettingsHotkeyComponent,
			FormButtonComponent,
			CheckBoxComponent,
			I18nService: FakeI18nService,
			THelper: FakeTHelper,
			BoolOrHelper,
			HotkeyTitleHelper,
			SettingsService: Service.extend( Evented )
		})
	});

	stubDOMEvents( hooks );
	setupKeyboardLayoutMap( hooks );

	hooks.beforeEach(function() {
		const { default: HotkeyService } = hotkeyServiceInjector({
			config: { hotkeys: {} }
		});
		this.owner.register( "service:hotkey", HotkeyService );
	});


	test( "Normal mode", async function( assert ) {
		const hotkey = null;
		const content = { disabled: false, code: null };
		const model = ObjectBuffer.create({ content });
		this.setProperties({ hotkey, model });

		await render( hbs`{{settings-hotkey model=model hotkey=hotkey}}` );
		const elem = this.element.querySelector( ".settings-hotkey-component" );
		const input = elem.querySelector( "input" );
		const btnDelete = elem.querySelector( ".js-btn-delete" );
		const btnEdit = elem.querySelector( ".js-btn-edit" );
		const btnEnabled = elem.querySelector( ".js-btn-enabled" );

		assert.ok( elem instanceof HTMLDivElement, "Component exists and renders" );
		assert.strictEqual(
			input.value.trim(),
			"components.settings-hotkey.empty",
			"Shows empty translation string if no hotkey exists yet"
		);
		assert.ok( input.disabled, "Input field is disabled" );
		assert.ok( input.classList.contains( "is-empty" ), "Input field is empty" );
		assert.ok( btnDelete.disabled, "Delete button is disabled" );
		assert.notOk( btnDelete.title, "Delete button doesn't have a title if disabled" );
		assert.ok( btnDelete.querySelector( "i.fa-trash-o" ), "Delete button has the right icon" );
		assert.strictEqual(
			btnEdit.title,
			"components.settings-hotkey.edit",
			"Edit button has a title"
		);
		assert.ok( btnEdit.querySelector( "i.fa-pencil" ), "Edit button has the right icon" );
		assert.ok( btnEnabled.classList.contains( "checked" ), "Checkbox is checked" );
		assert.strictEqual(
			btnEnabled.title,
			"components.settings-hotkey.toggle",
			"Checkbox has a title"
		);

		// create a default hotkey
		this.set( "hotkey", { code: "Enter", ctrlKey: true } );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.ctrlKey+Enter",
			"Shows hotkey string if default hotkey exists"
		);
		assert.notOk( input.classList.contains( "is-empty" ), "Input field is not empty anymore" );

		// create custom hotkey
		run( () => model.set( "code", "Escape" ) );
		assert.strictEqual(
			input.value.trim(),
			"Escape",
			"Shows hotkey string of custom hotkey if it exists"
		);
		assert.ok( input.disabled, "Input field is always disabled in normal mode" );
		assert.notOk( input.classList.contains( "is-empty" ), "Input field is still not empty" );
		assert.notOk( btnDelete.disabled, "Delete button is not disabled if custom hotkey is set" );
		assert.strictEqual(
			btnDelete.title,
			"components.settings-hotkey.delete",
			"Delete button has a title if custom hotkey is set"
		);

		// disable hotkey
		await click( btnEnabled );
		assert.notOk(
			btnEnabled.classList.contains( "checked" ),
			"Checkbox is not checked after clicking it"
		);
		assert.ok( model.get( "disabled" ), "Hotkey is now disabled" );

		// set all modifiers and delete custom hotkey
		run( () => model.setProperties({
			altKey: true,
			ctrlKey: true,
			metaKey: true,
			shiftKey: true
		}) );
		await click( btnDelete );
		assert.propEqual(
			model.getProperties( "disabled", "code", "altKey", "ctrlKey", "metaKey", "shiftKey" ),
			{
				disabled: true,
				code: null,
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false
			},
			"Delete button unsets custom hotkey with all properties except disabled property"
		);

		// re-enable
		await click( btnEnabled );
		assert.ok( btnEnabled.classList.contains( "checked" ), "Checkbox is checked again" );
		assert.notOk( model.get( "disabled" ), "Hotkey is not disabled anymore" );

		// re-disable and set custom hotkey data
		run( () => model.setProperties({
			disabled: true,
			code: "Space",
			shiftKey: true
		}) );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.shiftKey+Space",
			"Shows hotkey string of custom hotkey if it exists"
		);
		assert.notOk( input.classList.contains( "is-empty" ), "Input field is not empty" );
		assert.notOk( btnEnabled.classList.contains( "checked" ), "Checkbox is not checked again" );
		assert.ok( model.get( "disabled" ), "Hotkey is disabled again" );

		// discard changes and trigger property changes from outside
		run( () => model.discardChanges() );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.ctrlKey+Enter",
			"Shows hotkey string of default hotkey if custom hotkey gets reset"
		);
		assert.ok( btnEnabled.classList.contains( "checked" ), "Is checked after reset" );
	});

	test( "Editing mode", async function( assert ) {
		const hotkey = { code: "Enter" };
		const content = { disabled: false, code: null };
		const model = ObjectBuffer.create({ content });
		this.setProperties({ hotkey: null, model });

		await render( hbs`{{settings-hotkey model=model hotkey=hotkey}}` );
		const elem = this.element.querySelector( ".settings-hotkey-component" );
		const input = elem.querySelector( "input" );
		const btnEnabled = elem.querySelector( ".js-btn-enabled" );
		let e;

		assert.ok( input.disabled, "Input field is disabled in normal mode" );
		assert.ok( input.classList.contains( "is-empty" ), "Input field is empty" );
		assert.notEqual( document.activeElement, input, "Input is not focused" );

		// disable hotkey
		await click( btnEnabled );
		assert.notOk( btnEnabled.classList.contains( "checked" ), "Checkbox is not checked now" );
		assert.ok( model.get( "disabled" ), "Hotkey is disabled now" );

		// edit
		await click( elem.querySelector( ".js-btn-edit" ) );
		assert.strictEqual(
			input.value.trim(),
			"components.settings-hotkey.empty",
			"Shows empty translation string if no hotkey exists yet"
		);
		assert.notOk( input.disabled, "Input field is not disabled in edit mode" );
		assert.ok( input.classList.contains( "is-empty" ), "Input field is still empty" );
		assert.strictEqual( document.activeElement, input, "Input gets focused when editing" );
		assert.notOk(
			elem.querySelector( ".js-btn-delete" ),
			"Delete button is not shown in edit mode"
		);
		assert.notOk(
			elem.querySelector( ".js-btn-edit" ),
			"Edit button is not shown in edit mode"
		);
		assert.ok(
			elem.querySelector( ".js-btn-enabled" ),
			"Check box is always visible"
		);

		this.setProperties({ hotkey });
		assert.strictEqual( input.value.trim(), "Enter", "Shows the default hotkey" );
		assert.notOk( input.classList.contains( "is-empty" ), "Input field is not empty anymore" );

		const btnDiscard = elem.querySelector( ".js-btn-discard" );
		const btnConfirm = elem.querySelector( ".js-btn-confirm" );

		assert.ok(
			btnDiscard.classList.contains( "btn-danger" ),
			"Discard button has the right color"
		);
		assert.ok( btnDiscard.querySelector( "i.fa-times" ), "Discard button has the right icon" );
		assert.strictEqual(
			btnDiscard.title,
			"components.settings-hotkey.discard",
			"Discard button has a title"
		);
		assert.notOk( btnDiscard.disabled, "Discard button is not disabled" );
		assert.ok(
			btnConfirm.classList.contains( "btn-success" ),
			"Confirm button has the right color"
		);
		assert.ok( btnConfirm.querySelector( "i.fa-check" ), "Confirm button has the right icon" );
		assert.strictEqual(
			btnConfirm.title,
			"components.settings-hotkey.confirm",
			"Confirm button has a title"
		);
		assert.notOk( btnConfirm.disabled, "Confirm button is not disabled" );

		// ignored inputs
		e = await triggerEvent( input, "keydown", { code: "Space" } );
		assert.ok( isDefaultPrevented( e ), "Prevents default action on keydown" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops immediate propagation on keydown" );
		assert.strictEqual( input.value.trim(), "Enter", "Input does not use the keydown event" );
		assert.strictEqual( model.get( "code" ), null, "Custom hotkey was not modified" );

		e = await triggerEvent( input, "keyup", { code: "ShiftLeft", shiftKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default action on keyup" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops immediate propagation on keyup" );
		assert.strictEqual( input.value.trim(), "Enter", "Ignored codes do not change the input" );
		assert.strictEqual( model.get( "code" ), null, "Custom hotkey was not modified" );

		// unfocus input
		await blur( input );
		assert.notEqual( document.activeElement, input, "Input is not focused" );

		// non-recording keyboard event
		e = await triggerEvent( input, "keyup", { code: "F24" } );
		assert.notOk( isDefaultPrevented( e ), "Doesn't prevent default action if not recording" );
		assert.notOk( isImmediatePropagationStopped( e ), "Doesn't stop immediate propagation" );
		assert.strictEqual( input.value.trim(), "Enter", "Doesn't change the input" );
		assert.strictEqual( model.get( "code" ), null, "Custom hotkey was not modified" );

		// confirm (without proper user input)
		await click( elem.querySelector( ".js-btn-confirm" ) );
		assert.ok( this.element.querySelector( ".js-btn-edit" ), "Not in edit mode anymore" );
		assert.strictEqual( input.value.trim(), "Enter", "Still shows default hotkey" );
		assert.strictEqual( model.get( "code" ), null, "Custom hotkey was not modified" );

		// manually set custom hotkey
		run( () => model.set( "code", "Escape" ) );

		// edit
		await click( elem.querySelector( ".js-btn-edit" ) );
		assert.notOk( this.element.querySelector( ".js-btn-edit" ), "In edit mode again" );
		assert.strictEqual( input.value.trim(), "Escape", "Shows the custom hotkey if it is set" );

		// set a custom hotkey via user input
		e = await triggerEvent( input, "keyup", { code: "Backspace", ctrlKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default action on keyup" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops immediate propagation on keyup" );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.ctrlKey+Backspace",
			"Updates input field with temp hotkey"
		);
		assert.strictEqual( model.get( "code" ), "Escape", "Custom hotkey was not modified" );

		// discard
		await click( elem.querySelector( ".js-btn-discard" ) );
		assert.ok( this.element.querySelector( ".js-btn-edit" ), "Not in edit mode anymore" );
		assert.strictEqual( input.value.trim(), "Escape", "Resets input when clicking discard" );
		assert.strictEqual( model.get( "code" ), "Escape", "Custom hotkey was not modified" );

		// edit
		await click( elem.querySelector( ".js-btn-edit" ) );
		assert.notOk( this.element.querySelector( ".js-btn-edit" ), "In edit mode again" );

		// set a custom hotkey via user input again
		e = await triggerEvent( input, "keyup", { code: "Space", shiftKey: true } );
		assert.ok( isDefaultPrevented( e ), "Prevents default action on keyup" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops immediate propagation on keyup" );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.shiftKey+Space",
			"Updates input field with temp hotkey"
		);
		assert.strictEqual( model.get( "code" ), "Escape", "Custom hotkey was not modified" );

		// confirm
		await click( elem.querySelector( ".js-btn-confirm" ) );
		assert.ok( this.element.querySelector( ".js-btn-edit" ), "Not in edit mode anymore" );
		assert.strictEqual(
			input.value.trim(),
			"hotkeys.modifiers.shiftKey+Space",
			"Keeps new hotkey string on confirm"
		);
		assert.propEqual(
			model.getProperties( "disabled", "code", "altKey", "ctrlKey", "metaKey", "shiftKey" ),
			{
				disabled: true,
				code: "Space",
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: true
			},
			"Sets new hotkey on confirm, but doesn't change the disabled property"
		);
	});

	test( "One-way input value binding", async function( assert ) {
		const content = { disabled: false, code: null };
		const model = ObjectBuffer.create({ content });
		this.setProperties({ hotkey: null, model });

		await render( hbs`{{settings-hotkey model=model hotkey=hotkey}}` );
		const elem = this.element.querySelector( ".settings-hotkey-component" );
		const input = elem.querySelector( "input" );

		await click( elem.querySelector( ".js-btn-edit" ) );

		assert.strictEqual(
			input.value.trim(),
			"components.settings-hotkey.empty",
			"Shows empty translation string if no hotkey exists yet"
		);
		assert.notOk( input.disabled, "Input field is not disabled in edit mode" );
		assert.ok( input.classList.contains( "is-empty" ), "Input field is empty" );

		input.value = "invalid";
		await triggerEvent( input, "change" );

		await triggerEvent( input, "keyup", { code: "Space" } );
		assert.strictEqual( input.value.trim(), "Space", "Shows the new hotkey text" );
		assert.notOk( input.classList.contains( "is-empty" ), "Input field is not empty anymore" );
	});
});
