import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { I18nService } from "i18n-utils";
import Component from "@ember/component";
import $ from "jquery";
import sinon from "sinon";

import HotkeyMixin from "ui/components/-mixins/hotkey";
import HotkeyService from "services/hotkey/service";


moduleForComponent( "services/hotkey", {
	integration: true,
	resolver: buildResolver({
		HotkeyService,
		I18nService
	}),
	beforeEach() {
		this.inject.service( "hotkey" );
		const hotkeyService = this.get( "hotkey" );

		const $context = this.$();
		$context.on( "keyup", e => hotkeyService.trigger( e ) );

		this.trigger = ( data, $elem ) => {
			const event = $.Event( "keyup" );
			Object.assign( event, data );
			( $elem || $context ).trigger( event );
			return event;
		};
	}
});


test( "Simple hotkey registrations", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub();
	const listener = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionA
		}]
	}) );
	this.registry.register( "component:component-b", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Escape",
			action: "foo"
		}],
		actions: {
			foo: actionB
		}
	}) );
	this.registry.register( "component:component-c", Component.extend( HotkeyMixin, {} ) );

	this.render( hbs`{{component-a}}{{component-b}}{{component-c}}` );
	$( this._element.parentNode ).on( "keyup", listener );

	assert.strictEqual(
		this.get( "hotkey.registries.length" ),
		2,
		"Only has two hotkey registries"
	);

	this.trigger({ code: "Enter" });
	assert.ok( actionA.calledOnce, "Executes component A action" );
	assert.notOk( actionB.called, "Doesn't execute component B action" );
	assert.notOk( listener.called, "Doesn't propagate matching events" );
	actionA.resetHistory();

	this.trigger({ code: "Escape" });
	assert.notOk( actionA.called, "Doesn't execute component A action" );
	assert.ok( actionB.calledOnce, "Executes component B action" );
	assert.notOk( listener.called, "Doesn't propagate matching events" );
	actionB.resetHistory();

	this.trigger({ code: "KeyA" });
	assert.notOk( actionA.called, "Doesn't execute component A action" );
	assert.notOk( actionB.called, "Doesn't execute component B action" );
	assert.strictEqual( listener.args[0][0].code, "KeyA", "Propagates non-matching events" );

	$( this._element.parentNode ).off( "keyup", listener );

});


test( "Hotkeys with modifiers", function( assert ) {

	const action = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Escape",
			altKey: true,
			ctrlKey: true,
			shiftKey: true,
			action
		}]
	}) );

	this.render( hbs`{{component-a}}` );

	this.trigger({
		code: "Escape",
		altKey: false,
		ctrlKey: false,
		shiftKey: false
	});
	assert.notOk( action.called, "Doesn't trigger action on non-matching modifiers" );

	this.trigger({
		code: "Escape",
		altKey: true,
		ctrlKey: true,
		shiftKey: true
	});
	assert.ok( action.called, "Triggers action on matching modifiers" );

});


test( "Hotkeys with multiple codes", function( assert ) {

	const action = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: [ "Enter", "Escape" ],
			action
		}]
	}) );

	this.render( hbs`{{component-a}}` );

	this.trigger({ code: "Enter" });
	assert.ok( action.called, "Executes action on Enter" );

	this.trigger({ code: "Escape" });
	assert.ok( action.calledTwice, "Executes action on Escape" );

});


test( "Multiple components with similar hotkeys", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub();
	const actionC = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionA
		}]
	}) );
	this.registry.register( "component:component-b", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionB
		}]
	}) );
	this.registry.register( "component:component-c", Component.extend( HotkeyMixin, {
		disableHotkeys: true,
		hotkeys: [{
			code: "Enter",
			action: actionC
		}]
	}) );

	this.render( hbs`{{component-a}}{{component-b}}{{component-c}}` );

	this.trigger({ code: "Enter" });
	assert.notOk( actionA.called, "Doesn't call all matching actions" );
	assert.ok( actionB.called, "Call first matching action" );
	assert.notOk( actionC.called, "Doesn't call disabled actions" );

});


test( "Removed hotkey components", function( assert ) {

	const action = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action
		}]
	}) );

	this.set( "shown", false );
	this.render( hbs`{{#if shown}}{{component-a}}{{/if}}` );

	assert.strictEqual( this.get( "hotkey.registries.length" ), 0, "Has no actions registered" );
	this.trigger({ code: "Enter" });
	assert.notOk( action.called, "Doesn't execute action" );

	this.set( "shown", true );

	assert.strictEqual( this.get( "hotkey.registries.length" ), 1, "Has one action registered" );
	this.trigger({ code: "Enter" });
	assert.ok( action.calledOnce, "Execute action" );
	action.resetHistory();

	this.set( "shown", false );

	assert.strictEqual( this.get( "hotkey.registries.length" ), 0, "Has no actions registered" );
	this.trigger({ code: "Enter" });
	assert.notOk( action.called, "Doesn't execute action" );

});


test( "Focus on input element", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub();

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionA
		}]
	}) );
	this.registry.register( "component:component-b", Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Escape",
			force: true,
			action: actionB
		}]
	}) );

	this.render( hbs`<input type="text">{{component-a}}{{component-b}}` );
	const $input = this.$( "input" );

	$input.focus();

	this.trigger( { code: "Enter" }, $input );
	assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
	assert.notOk( actionB.called, "Doesn't execute actions when an input element is focused" );

	this.trigger( { code: "Escape" }, $input );
	assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
	assert.ok( actionB.calledOnce, "Executes actions when the force flag is set" );

});


test( "Component subclasses with duplicate hotkeys", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub();
	const actionC = sinon.stub();

	const ParentComponent = Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionA
		}, {
			code: "Escape",
			action: actionB
		}]
	});
	const ChildComponent = ParentComponent.extend({
		hotkeys: [{
			code: "Enter",
			action: actionC
		}]
	});

	this.registry.register( "component:component-a", ChildComponent );

	this.render( hbs`{{component-a}}` );

	this.trigger({ code: "Enter" });
	assert.notOk( actionA.called, "Doesn't call parent's Enter action" );
	assert.notOk( actionB.called, "Doesn't call parent's Escape action" );
	assert.ok( actionC.calledOnce, "Calls child's Enter action" );
	actionC.resetHistory();

	this.trigger({ code: "Escape" });
	assert.notOk( actionA.called, "Doesn't call parent's Enter action" );
	assert.ok( actionB.calledOnce, "Calls parent's Escape action" );
	assert.notOk( actionC.called, "Doesn't call child's Enter action" );

});


test( "Event bubbling", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub().returns( true );
	const actionC = sinon.stub();
	let e;

	const componentA = Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Escape",
			action: actionA
		}, {
			code: "Enter",
			action: actionB
		}]
	});

	const componentB = Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Escape",
			action: actionC
		}]
	});

	this.registry.register( "component:component-a", componentA );
	this.registry.register( "component:component-b", componentB );

	this.render( hbs`{{component-a}}{{component-b}}` );

	e = this.trigger({ code: "Escape" });
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	assert.notOk( actionA.called, "Doesn't call parent's Escape action" );
	assert.notOk( actionB.called, "Doesn't call parent's Enter action" );
	assert.ok( actionC.calledOnce, "Calls child's Escape action" );
	actionC.resetHistory();

	actionC.returns( true );

	e = this.trigger({ code: "Escape" });
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	assert.ok( actionA.calledOnce, "Calls parent's Escape action" );
	assert.notOk( actionB.called, "Doesn't call parent's Enter action" );
	assert.ok( actionC.calledOnce, "Calls child's Escape action" );
	actionA.resetHistory();
	actionC.resetHistory();

	e = this.trigger({ code: "Enter" });
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );
	assert.notOk( actionA.calledOnce, "Doesn't call parent's Escape action" );
	assert.ok( actionB.called, "Calls parent's Enter action" );
	assert.notOk( actionC.calledOnce, "Doesn't call child's Escape action" );

});


test( "Re-inserted components", function( assert ) {

	const actionA = sinon.stub();
	const actionB = sinon.stub();

	const MyButton = Component.extend( HotkeyMixin, {
		hotkeys: [{
			code: "Enter",
			action: actionA
		}, {
			code: "Enter",
			ctrlKey: true,
			action: actionB
		}]
	});

	this.registry.register( "component:my-button", MyButton );


	this.set( "shown", true );
	this.render( hbs`{{#if shown}}{{my-button}}{{/if}}` );

	const registries = this.get( "hotkey.registries" );
	const [ firstHotkeyOne, firstHotkeyTwo ] = registries[0].hotkeys;

	this.trigger({
		code: "Enter",
		ctrlKey: true
	});

	// re-insert component
	this.set( "shown", false );
	this.set( "shown", true );

	this.trigger({
		code: "Enter",
		ctrlKey: true
	});

	const [ secondHotkeyOne, secondHotkeyTwo ] = registries[0].hotkeys;

	assert.strictEqual( firstHotkeyOne, secondHotkeyOne, "Hotkey order stays the same" );
	assert.strictEqual( firstHotkeyTwo, secondHotkeyTwo, "Hotkey order stays the same" );

});


test( "Component title", function( assert ) {

	this.registry.register( "component:component-a", Component.extend( HotkeyMixin, {
		attributeBindings: [ "title" ]
	}) );

	this.setProperties({
		title: "foo",
		hotkeys: [{ code: "KeyA" }]
	});
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"[A] foo",
		"Updates the title when hotkey is alphanumerical"
	);
	this.clearRender();

	this.set( "hotkeys", [{ code: [ "KeyA", "KeyB" ] }] );
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"[A] foo",
		"Updates the title when hotkey has aliases"
	);
	this.clearRender();

	this.set( "hotkeys", [{ code: "Escape" }] );
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"[hotkeys.keys.Escape] foo",
		"Updates the title when hotkey is named"
	);
	this.clearRender();

	this.set( "hotkeys", [{ code: "KeyA", ctrlKey: true }] );
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"[hotkeys.modifiers.ctrl+A] foo",
		"Updates the title when hotkey is alphanumerical and a modifier is required"
	);
	this.clearRender();

	this.set( "hotkeys", [{ code: "KeyA", ctrlKey: true, shiftKey: true, altKey: true }] );
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"[hotkeys.modifiers.ctrl+hotkeys.modifiers.shift+hotkeys.modifiers.alt+A] foo",
		"Updates the title when hotkey is alphanumerical and multiple modifiers are required"
	);
	this.clearRender();

	this.setProperties({
		title: "",
		hotkeys: [{ code: "KeyA" }]
	});
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"",
		"Doesn't update the title when title is missing"
	);
	this.clearRender();

	this.setProperties({
		title: "foo",
		hotkeys: []
	});
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"foo",
		"Doesn't update the title when hotkeys are missing"
	);
	this.clearRender();

	this.setProperties({
		title: "foo",
		hotkeys: [{ code: "KeyA" }]
	});
	this.render( hbs`{{component-a _title=title hotkeys=hotkeys disableHotkeys=true}}` );
	assert.strictEqual(
		this.$( "*" ).eq( 0 ).prop( "title" ),
		"foo",
		"Doesn't update the title when disableHotkeys is set to true"
	);

});
