import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	buildOwner,
	fixtureElement
} from "test-utils";
import {
	get,
	set,
	setOwner,
	$,
	HTMLBars,
	inject,
	run,
	Component,
	EventDispatcher
} from "ember";
import HotkeyMixin from "components/mixins/hotkey";
import HotkeyService from "services/HotkeyService";


const { compile } = HTMLBars;
const { service } = inject;


let eventDispatcher, owner, context;

const HotkeyComponent = Component.extend( HotkeyMixin );
const ApplicationComponent = Component.extend({
	hotkey: service(),
	keyUp( e ) {
		return get( this, "hotkey" ).trigger( e );
	}
});


module( "services/HotkeyService", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "service:hotkey", HotkeyService );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Simple hotkey registrations", assert => {

	assert.expect( 4 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					assert.ok( true, "Action is called" );
				}
			}
		]
	}) );
	owner.register( "component:component-b", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Escape",
				action: "foo"
			}
		],
		actions: {
			foo() {
				assert.ok( true, "Action is called" );
			}
		}
	}) );
	owner.register( "component:component-c", HotkeyComponent.extend({}) );

	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}{{component-b}}{{component-c}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	assert.strictEqual(
		get( owner.lookup( "service:hotkey" ), "registries.length" ),
		2,
		"Only has two hotkey registries"
	);

	const keyupCallback = e => {
		assert.strictEqual( e.code, "KeyA", "Propagates events if key event doesn't match" );
	};
	$( fixtureElement ).on( "keyup", keyupCallback );

	let e;
	const $element = context.$();

	// first hotkey with action as function
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	// second hotkey with action as string
	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );

	// non-matching hotkey
	e = $.Event( "keyup" );
	e.code = "KeyA";
	$element.trigger( e );

	$( fixtureElement ).off( "keyup", keyupCallback );

});


test( "Hotkeys with modifiers", assert => {

	assert.expect( 1 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Escape",
				altKey: true,
				ctrlKey: true,
				shiftKey: true,
				action() {
					assert.ok( true, "Action is called" );
				}
			}
		]
	}) );

	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$();

	// does not trigger when the altKey, ctrlKey and shiftKey are not pressed
	e = $.Event( "keyup" );
	e.code = "Escape";
	e.altKey = false;
	e.ctrlKey = false;
	e.shiftKey = false;
	$element.trigger( e );

	// triggers the hotkey
	e = $.Event( "keyup" );
	e.code = "Escape";
	e.altKey = true;
	e.ctrlKey = true;
	e.shiftKey = true;
	$element.trigger( e );

});


test( "Hotkeys with multiple codes", assert => {

	assert.expect( 2 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: [ "Enter", "Escape" ],
				action() {
					assert.ok( true, "Action is called" );
				}
			}
		]
	}) );

	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$();

	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );

});


test( "Multiple components with similar hotkeys", assert => {

	assert.expect( 1 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					throw new Error();
				}
			}
		]
	}) );
	owner.register( "component:component-b", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	}) );
	owner.register( "component:component-c", HotkeyComponent.extend({
		disableHotkeys: true,
		hotkeys: [
			{
				code: "Enter",
				action() {
					assert.ok( false, "Action should not be called" );
				}
			}
		]
	}) );

	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}{{component-b}}{{component-c}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$();

	// always call the hotkey action of the newest component
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

});


test( "Removed hotkey components", assert => {

	assert.expect( 4 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	}) );

	context = ApplicationComponent.create({
		show: false,
		layout: compile( "{{#if show}}{{component-a}}{{/if}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$();
	const hotkeyService = owner.lookup( "service:hotkey" );

	// do not call action
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	assert.strictEqual( get( hotkeyService, "registries.length" ), 0, "Has no actions registered" );

	run( () => set( context, "show", true ) );

	// call action
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	assert.strictEqual( get( hotkeyService, "registries.length" ), 1, "Has one action registered" );

	run( () => set( context, "show", false ) );

	// don't call action
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	assert.strictEqual( get( hotkeyService, "registries.length" ), 0, "Has no actions registered" );

});


test( "Focus on input element", assert => {

	assert.expect( 1 );

	owner.register( "component:component-a", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					throw new Error();
				}
			}
		]
	}) );
	owner.register( "component:component-b", HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Escape",
				force: true,
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	}) );

	context = ApplicationComponent.create({
		layout: compile( "<input type='text'>{{component-a}}{{component-b}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$( "input" );

	$element.focus();

	// do not call action
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	// call action
	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );

});


test( "Component subclasses with duplicate hotkeys", assert => {

	assert.expect( 2 );

	const ParentComponent = HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					throw new Error();
				}
			},
			{
				code: "Escape",
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	});
	const ChildComponent = ParentComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	});

	owner.register( "component:component-a", ChildComponent );

	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	let e;
	const $element = context.$();

	// call action of child component
	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );

	// call action of parent component
	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );

});


test( "Event bubbling", assert => {

	assert.expect( 10 );

	let result = false;
	let e;

	const componentA = HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Escape",
				action() {
					assert.ok( true, "Calls A's escape action" );
				}
			},
			{
				code: "Enter",
				action() {
					assert.ok( true, "Calls A's enter action" );
					return true;
				}
			}
		]
	});

	const componentB = HotkeyComponent.extend({
		hotkeys: [{
			code: "Escape",
			action() {
				assert.ok( true, "Calls B's escape action" );
				return result;
			}
		}]
	});

	owner.register( "component:component-a", componentA );
	owner.register( "component:component-b", componentB );


	context = ApplicationComponent.create({
		layout: compile( "{{component-a}}{{component-b}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	const $element = context.$();

	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );

	result = true;

	e = $.Event( "keyup" );
	e.code = "Escape";
	$element.trigger( e );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );

	e = $.Event( "keyup" );
	e.code = "Enter";
	$element.trigger( e );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

});


test( "Re-inserted components", assert => {

	assert.expect( 3 );

	const MyButton = HotkeyComponent.extend({
		hotkeys: [
			{
				code: "Enter",
				action() {
					throw new Error();
				}
			},
			{
				code: "Enter",
				ctrlKey: true,
				action() {
					assert.ok( true, "Action has been called" );
				}
			}
		]
	});

	owner.register( "component:my-button", MyButton );


	context = ApplicationComponent.create({
		shown: true,
		layout: compile( "{{#if shown}}{{my-button}}{{/if}}" )
	});
	setOwner( context, owner );

	runAppend( context );

	const registries = owner.lookup( "service:hotkey" ).registries;
	const [ firstHotkeyOne, firstHotkeyTwo ] = registries[0].hotkeys;

	let e;
	const $element = context.$();

	e = $.Event( "keyup" );
	e.code = "Enter";
	e.ctrlKey = true;
	$element.trigger( e );

	// re-insert component
	run( () => set( context, "shown", false ) );
	run( () => set( context, "shown", true ) );

	e = $.Event( "keyup" );
	e.code = "Enter";
	e.ctrlKey = true;
	$element.trigger( e );

	const [ secondHotkeyOne, secondHotkeyTwo ] = registries[0].hotkeys;

	assert.ok(
		firstHotkeyOne === secondHotkeyOne && firstHotkeyTwo === secondHotkeyTwo,
		"Hotkey order stays the same"
	);

});


test( "Component title", assert => {

	const Component = HotkeyComponent.extend({
		title: "foo"
	});

	context = Component.create({
		hotkeys: [ { code: "KeyA" } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"[A] foo",
		"Updates the title when hotkey is alphanumerical"
	);
	runDestroy( context );

	context = Component.create({
		hotkeys: [ { code: [ "KeyA", "KeyB" ] } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"[A] foo",
		"Updates the title when hotkey has aliases"
	);
	runDestroy( context );

	context = Component.create({
		hotkeys: [ { code: "Escape" } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"[Esc] foo",
		"Updates the title when hotkey is found in name map"
	);
	runDestroy( context );

	context = Component.create({
		hotkeys: [ { code: "KeyA", ctrlKey: true } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"[Ctrl+A] foo",
		"Updates the title when hotkey is alphanumerical and a modifier is required"
	);
	runDestroy( context );

	context = Component.create({
		hotkeys: [ { code: "KeyA", ctrlKey: true, shiftKey: true, altKey: true } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"[Ctrl+Shift+Alt+A] foo",
		"Updates the title when hotkey is alphanumerical and multiple modifiers are required"
	);
	runDestroy( context );

	context = Component.create({
		title: "",
		hotkeys: [ { code: "KeyA" } ]
	});
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"",
		"Doesn't updates the title when title is missing"
	);
	runDestroy( context );

	context = Component.create();
	setOwner( context, owner );
	runAppend( context );
	assert.strictEqual(
		get( context, "title" ),
		"foo",
		"Doesn't updates the title when hotkeys are missing"
	);
	runDestroy( context );

});
