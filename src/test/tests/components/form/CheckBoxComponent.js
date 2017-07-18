import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	getElem,
	cleanOutput,
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
import HotkeyService from "services/HotkeyService";
import CheckBoxComponent from "components/form/CheckBoxComponent";


const { service } = inject;
const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/form/CheckBoxComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "service:hotkey", HotkeyService );
		owner.register( "component:check-box", CheckBoxComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "CheckBoxComponent", function( assert ) {

	context = Component.extend({
		checked: true,
		disabled: false,
		layout: compile(
			"{{#check-box checked=checked disabled=disabled}}foo{{/check-box}}"
		)
	}).create();
	setOwner( context, owner );

	// initial
	runAppend( context );
	assert.equal(
		cleanOutput( context, ".check-box-component" ),
		"foo",
		"The CheckBoxComponent has a label"
	);
	assert.equal(
		getElem( context, ".check-box-component" ).hasClass( "checked" ),
		true,
		"The CheckBoxComponent's checked state is set on initialization"
	);

	// set to false in context
	run(function() {
		set( context, "checked", false );
	});
	assert.equal(
		getElem( context, ".check-box-component" ).hasClass( "checked" ),
		false,
		"The CheckBoxComponent reacts to changes of the checked attribute"
	);

	// toggle by clicking the CheckBoxComponent
	run(function() {
		getElem( context, ".check-box-component" ).click();
	});
	assert.equal(
		getElem( context, ".check-box-component" ).hasClass( "checked" ),
		true,
		"The CheckBoxComponent was clicked and checked is now true"
	);
	assert.equal(
		get( context, "checked" ),
		true,
		"The context's checked variable is true as well"
	);

	// disable CheckBoxComponent
	run(function() {
		set( context, "disabled", true );
	});
	assert.equal(
		getElem( context, ".check-box-component" ).hasClass( "disabled" ),
		true,
		"The CheckBoxComponent is now disabled"
	);

	// try to click the disabled CheckBoxComponent
	run(function() {
		getElem( context, ".check-box-component" ).click();
	});
	assert.equal(
		getElem( context, ".check-box-component" ).hasClass( "checked" ),
		true,
		"The disabled CheckBoxComponent can't be clicked"
	);
	assert.equal(
		get( context, "checked" ),
		true,
		"The context's checked variable is still true"
	);

});


test( "CheckBoxComponent - without block", function( assert ) {

	context = Component.extend({
		label: "foo",
		layout: compile(
			"{{check-box label}}"
		)
	}).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal(
		cleanOutput( context, ".check-box-component" ),
		"foo",
		"The CheckBoxComponent has a label"
	);

	run(function() {
		set( context, "label", "bar" );
	});
	assert.equal(
		cleanOutput( context, ".check-box-component" ),
		"bar",
		"The label updates"
	);

});


test( "Hotkeys", assert => {

	let e;

	context = Component.extend({
		checked: false,
		disabled: false,
		layout: compile( "{{check-box 'foo' checked=checked disabled=disabled}}" ),

		hotkey: service(),
		keyUp( e ) {
			return get( this, "hotkey" ).trigger( e );
		}
	}).create();
	setOwner( context, owner );
	runAppend( context );

	const $context = context.$();
	const $elem = $context.find( ".check-box-component" );

	const trigger = code => run( () => {
		e = $.Event( "keyup" );
		e.code = code;
		$context.trigger( e );
	});

	assert.notStrictEqual( document.activeElement, $elem[0], "Is not focused initially" );
	assert.strictEqual( get( context, "checked" ), false, "Is not checked initially" );
	assert.strictEqual( $elem.attr( "tabindex" ), "0", "Has a tabindex attribute with value 0" );

	trigger( "Space" );
	assert.strictEqual( get( context, "checked" ), false, "Is still not checked on Space" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	trigger( "Space" );
	assert.strictEqual( get( context, "checked" ), true, "Is checked on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	trigger( "Space" );
	assert.strictEqual( get( context, "checked" ), false, "Is not checked anymore on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );

	trigger( "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

	run( () => set( context, "disabled", true ) );
	$elem.focus();
	assert.strictEqual( document.activeElement, $elem[0], "Is focused now" );

	trigger( "Space" );
	assert.strictEqual( get( context, "checked" ), false, "Is not checked on Space when disabled" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	trigger( "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

});
