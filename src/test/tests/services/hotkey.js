import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import { triggerKeyDownEvent } from "event-utils";
import { render, clearRender, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";

import HotkeyMixin from "ui/components/-mixins/hotkey";
import HotkeyService from "services/hotkey/service";


module( "services/hotkey", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyService,
			I18nService: FakeI18nService
		})
	});

	hooks.before(function() {
		this.Component = Component.extend( HotkeyMixin );
	});

	hooks.beforeEach(function() {
		this.parentlistener = sinon.spy();
		this.$().parent().on( "keydown", this.parentlistener );

		const hotkeyService = this.owner.lookup( "service:hotkey" );
		this.$().on( "keydown", e => hotkeyService.trigger( e ) );
	});

	hooks.afterEach(function() {
		this.$().parent().off( "keydown", this.parentlistener );
	});


	test( "Simple hotkey registrations", async function( assert ) {
		const hotkeyService = this.owner.lookup( "service:hotkey" );

		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionA
			}]
		}) );
		this.owner.register( "component:component-b", this.Component.extend({
			hotkeys: [{
				key: "Escape",
				action: "foo"
			}],
			actions: {
				foo: actionB
			}
		}) );
		this.owner.register( "component:component-c", this.Component.extend() );

		await render( hbs`{{component-a}}{{component-b}}{{component-c}}` );

		assert.strictEqual( hotkeyService.registries.length, 2, "Only has two hotkey registries" );

		await triggerKeyDownEvent( this.element, "Enter" );
		assert.ok( actionA.calledOnce, "Executes component A action" );
		assert.notOk( actionB.called, "Doesn't execute component B action" );
		assert.notOk( this.parentlistener.called, "Doesn't propagate matching events" );
		actionA.resetHistory();

		await triggerKeyDownEvent( this.element, "Escape" );
		assert.notOk( actionA.called, "Doesn't execute component A action" );
		assert.ok( actionB.calledOnce, "Executes component B action" );
		assert.notOk( this.parentlistener.called, "Doesn't propagate matching events" );
		actionB.resetHistory();

		const event = await triggerKeyDownEvent( this.element, "a" );
		assert.notOk( actionA.called, "Doesn't execute component A action" );
		assert.notOk( actionB.called, "Doesn't execute component B action" );
		assert.ok(
			this.parentlistener.calledWithExactly( event ),
			"Lets non-matching events bubble up"
		);
	});


	test( "Hotkeys with modifiers", async function( assert ) {
		const action = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: "Escape",
				altKey: true,
				ctrlKey: true,
				shiftKey: true,
				action
			}]
		}) );

		await render( hbs`{{component-a}}` );

		await triggerKeyDownEvent( this.element, "Escape", {
			altKey: false,
			ctrlKey: false,
			shiftKey: false
		});
		assert.notOk( action.called, "Doesn't trigger action on non-matching modifiers" );

		await triggerKeyDownEvent( this.element, "Escape", {
			altKey: true,
			ctrlKey: true,
			shiftKey: true
		});
		assert.ok( action.called, "Triggers action on matching modifiers" );
	});


	test( "Hotkeys with multiple codes", async function( assert ) {
		const action = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: [ "Enter", "Escape" ],
				action
			}]
		}) );

		await render( hbs`{{component-a}}` );

		await triggerKeyDownEvent( this.element, "Enter" );
		assert.ok( action.called, "Executes action on Enter" );

		await triggerKeyDownEvent( this.element, "Escape" );
		assert.ok( action.calledTwice, "Executes action on Escape" );
	});


	test( "Multiple components with similar hotkeys", async function( assert ) {
		const actionA = sinon.spy();
		const actionB = sinon.spy();
		const actionC = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionA
			}]
		}) );
		this.owner.register( "component:component-b", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionB
			}]
		}) );
		this.owner.register( "component:component-c", this.Component.extend({
			disableHotkeys: true,
			hotkeys: [{
				key: "Enter",
				action: actionC
			}]
		}) );

		await render( hbs`{{component-a}}{{component-b}}{{component-c}}` );

		await triggerKeyDownEvent( this.element, "Enter" );
		assert.notOk( actionA.called, "Doesn't call all matching actions" );
		assert.ok( actionB.called, "Call first matching action" );
		assert.notOk( actionC.called, "Doesn't call disabled actions" );
	});


	test( "Removed hotkey components", async function( assert ) {
		const hotkeyService = this.owner.lookup( "service:hotkey" );

		const action = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action
			}]
		}) );

		this.set( "shown", false );
		await render( hbs`{{#if shown}}{{component-a}}{{/if}}` );

		assert.strictEqual( hotkeyService.registries.length, 0, "Has no actions registered" );
		await triggerKeyDownEvent( this.element, "Enter" );
		assert.notOk( action.called, "Doesn't execute action" );

		this.set( "shown", true );

		assert.strictEqual( hotkeyService.registries.length, 1, "Has one action registered" );
		await triggerKeyDownEvent( this.element, "Enter" );
		assert.ok( action.calledOnce, "Execute action" );
		action.resetHistory();

		this.set( "shown", false );

		assert.strictEqual( hotkeyService.registries.length, 0, "Has no actions registered" );
		await triggerKeyDownEvent( this.element, "Enter" );
		assert.notOk( action.called, "Doesn't execute action" );
	});


	test( "Focus on input element", async function( assert ) {
		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:component-a", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionA
			}]
		}) );
		this.owner.register( "component:component-b", this.Component.extend({
			hotkeys: [{
				key: "Escape",
				force: true,
				action: actionB
			}]
		}) );

		await render( hbs`<input type="text">{{component-a}}{{component-b}}` );
		const input = this.element.querySelector( "input" );

		await focus( input );

		await triggerKeyDownEvent( input, "Enter" );
		assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
		assert.notOk( actionB.called, "Doesn't execute actions when an input element is focused" );

		await triggerKeyDownEvent( input, "Escape" );
		assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
		assert.ok( actionB.calledOnce, "Executes actions when the force flag is set" );
	});


	test( "Component subclasses with duplicate hotkeys", async function( assert ) {
		const actionA = sinon.spy();
		const actionB = sinon.spy();
		const actionC = sinon.spy();

		const ParentComponent = this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionA
			}, {
				key: "Escape",
				action: actionB
			}]
		});
		const ChildComponent = ParentComponent.extend({
			hotkeys: [{
				key: "Enter",
				action: actionC
			}]
		});

		this.owner.register( "component:component-a", ChildComponent );

		await render( hbs`{{component-a}}` );

		await triggerKeyDownEvent( this.element, "Enter" );
		assert.notOk( actionA.called, "Doesn't call parent's Enter action" );
		assert.notOk( actionB.called, "Doesn't call parent's Escape action" );
		assert.ok( actionC.calledOnce, "Calls child's Enter action" );
		actionC.resetHistory();

		await triggerKeyDownEvent( this.element, "Escape" );
		assert.notOk( actionA.called, "Doesn't call parent's Enter action" );
		assert.ok( actionB.calledOnce, "Calls parent's Escape action" );
		assert.notOk( actionC.called, "Doesn't call child's Enter action" );
	});


	test( "Event bubbling", async function( assert ) {
		const actionA = sinon.stub();
		const actionB = sinon.stub().returns( true );
		const actionC = sinon.stub();
		let e;

		const componentA = this.Component.extend({
			hotkeys: [{
				key: "Escape",
				action: actionA
			}, {
				key: "Enter",
				action: actionB
			}]
		});

		const componentB = this.Component.extend({
			hotkeys: [{
				key: "Escape",
				action: actionC
			}]
		});

		this.owner.register( "component:component-a", componentA );
		this.owner.register( "component:component-b", componentB );

		await render( hbs`{{component-a}}{{component-b}}` );

		e = await triggerKeyDownEvent( this.element, "Escape" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
		assert.notOk( actionA.called, "Doesn't call parent's Escape action" );
		assert.notOk( actionB.called, "Doesn't call parent's Enter action" );
		assert.ok( actionC.calledOnce, "Calls child's Escape action" );
		actionC.resetHistory();

		actionC.returns( true );

		e = await triggerKeyDownEvent( this.element, "Escape" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
		assert.ok( actionA.calledOnce, "Calls parent's Escape action" );
		assert.notOk( actionB.called, "Doesn't call parent's Enter action" );
		assert.ok( actionC.calledOnce, "Calls child's Escape action" );
		actionA.resetHistory();
		actionC.resetHistory();

		e = await triggerKeyDownEvent( this.element, "Enter" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );
		assert.notOk( actionA.calledOnce, "Doesn't call parent's Escape action" );
		assert.ok( actionB.called, "Calls parent's Enter action" );
		assert.notOk( actionC.calledOnce, "Doesn't call child's Escape action" );
	});


	test( "Re-inserted components", async function( assert ) {
		const hotkeyService = this.owner.lookup( "service:hotkey" );

		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:my-button", this.Component.extend({
			hotkeys: [{
				key: "Enter",
				action: actionA
			}, {
				key: "Enter",
				ctrlKey: true,
				action: actionB
			}]
		}) );

		this.set( "shown", true );
		await render( hbs`{{#if shown}}{{my-button}}{{/if}}` );

		const registries = hotkeyService.registries;
		const [ firstHotkeyOne, firstHotkeyTwo ] = registries[0].hotkeys;

		await triggerKeyDownEvent( this.element, "Enter", { ctrlKey: true } );

		// re-insert component
		this.set( "shown", false );
		this.set( "shown", true );

		await triggerKeyDownEvent( this.element, "Enter", { ctrlKey: true } );

		const [ secondHotkeyOne, secondHotkeyTwo ] = registries[0].hotkeys;

		assert.strictEqual( firstHotkeyOne, secondHotkeyOne, "Hotkey order stays the same" );
		assert.strictEqual( firstHotkeyTwo, secondHotkeyTwo, "Hotkey order stays the same" );
	});


	test( "Component title", async function( assert ) {
		this.owner.register( "component:component-a", this.Component.extend({
			attributeBindings: [ "title" ]
		}) );

		this.setProperties({
			title: "foo",
			hotkeys: [{ key: "a" }]
		});
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"[A] foo",
			"Updates the title when hotkey is alphanumerical"
		);
		await clearRender();

		this.set( "hotkeys", [{ key: [ "a", "b" ] }] );
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"[A] foo",
			"Updates the title when hotkey has aliases"
		);
		this.clearRender();

		this.set( "hotkeys", [{ key: "Escape" }] );
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"[hotkeys.keys.Escape] foo",
			"Updates the title when hotkey is named"
		);
		await clearRender();

		this.set( "hotkeys", [{ key: "a", ctrlKey: true }] );
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"[hotkeys.modifiers.ctrl+A] foo",
			"Updates the title when hotkey is alphanumerical and a modifier is required"
		);
		await clearRender();

		this.set( "hotkeys", [{ key: "a", ctrlKey: true, shiftKey: true, altKey: true }] );
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"[hotkeys.modifiers.ctrl+hotkeys.modifiers.shift+hotkeys.modifiers.alt+A] foo",
			"Updates the title when hotkey is alphanumerical and multiple modifiers are required"
		);
		await clearRender();

		this.setProperties({
			title: "",
			hotkeys: [{ key: "a" }]
		});
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"",
			"Doesn't update the title when title is missing"
		);
		await clearRender();

		this.setProperties({
			title: "foo",
			hotkeys: []
		});
		await render( hbs`{{component-a _title=title hotkeys=hotkeys}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"foo",
			"Doesn't update the title when hotkeys are missing"
		);
		await clearRender();

		this.setProperties({
			title: "foo",
			hotkeys: [{ key: "a" }]
		});
		await render( hbs`{{component-a _title=title hotkeys=hotkeys disableHotkeys=true}}` );
		assert.strictEqual(
			this.element.firstElementChild.title,
			"foo",
			"Doesn't update the title when disableHotkeys is set to true"
		);
	});

});
