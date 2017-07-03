import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	getElem,
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
	EmberNativeArray,
	EventDispatcher
} from "ember";
import HotkeyService from "services/HotkeyService";
import IsEqualHelper from "helpers/IsEqualHelper";
import DropDownComponent from "components/form/DropDownComponent";


const { compile } = HTMLBars;
const { service } = inject;

let context, eventDispatcher, owner;


module( "components/form/DropDownComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "service:hotkey", HotkeyService );
		owner.register( "helper:is-equal", IsEqualHelper );
		owner.register( "component:drop-down", DropDownComponent );
	},

	afterEach() {
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		context = eventDispatcher = owner = null;
	}
});


test( "DOM nodes and component bindings", assert => {

	const content = new EmberNativeArray([
		{
			value: 1,
			label: "foo",
			anotherValue: 4,
			anotherLabel: "FOO"
		},
		{
			value: 2,
			label: "bar",
			anotherValue: 5,
			anotherLabel: "BAR"
		},
		{
			value: 3,
			label: "baz",
			anotherValue: 6,
			anotherLabel: "BAZ"
		}
	]);

	context = Component.extend({
		content,
		value: 2,
		optionValuePath: "value",
		optionLabelPath: "label",
		placeholder: "placeholder",
		layout: compile( `{{drop-down
			value=value
			content=content
			optionValuePath=optionValuePath
			optionLabelPath=optionLabelPath
			placeholder=placeholder
		}}` )
	}).create();
	setOwner( context, owner );
	runAppend( context );

	const $elem = getElem( context, ".drop-down-component" );
	const getSelectionLabel = () => $elem
		.children( ".drop-down-component-selection" )
		.text();
	const getItems = () => $elem
		.find( "> .drop-down-component-list > li" );
	const getItemLabels = () => getItems()
		.map( ( _, item ) => $( item ).text() )
		.toArray();
	const getItemSelections = () => getItems()
		.map( ( _, item ) => $( item ).hasClass( "selected" ) )
		.toArray();


	assert.ok( $elem[0] instanceof HTMLDivElement, "Renders the DropDownComponent" );

	// initial selection
	assert.strictEqual( getSelectionLabel(), "bar", "Sets initial selection label" );
	assert.deepEqual( getItemLabels(), [ "foo", "bar", "baz" ], "Sets initial item labels" );
	assert.deepEqual( getItemSelections(), [ false, true, false ], "Sets initial item selection" );

	// set a non-matching value
	run( () => set( context, "value", 0 ) );
	assert.strictEqual( getSelectionLabel(), "placeholder", "Shows placeholder selection label" );
	assert.deepEqual( getItemSelections(), [ false, false, false ], "No item is selected" );
	run( () => set( context, "placeholder", "no selection" ) );
	assert.strictEqual( getSelectionLabel(), "no selection", "Updates the placeholder label" );

	// set a matching value
	run( () => set( context, "value", 3 ) );
	assert.strictEqual( getSelectionLabel(), "baz", "Shows correct selection label" );
	assert.deepEqual( getItemSelections(), [ false, false, true ], "Updates item selections" );

	// click the first list item
	run( () => getItems().eq( 0 ).click() );
	assert.strictEqual( get( context, "value" ), 1, "Updates value binding on change" );
	assert.strictEqual( getSelectionLabel(), "foo", "Shows correct selection label" );
	assert.deepEqual( getItemSelections(), [ true, false, false ], "Updates item selections" );

	// change the optionLabelPath
	run( () => set( context, "optionLabelPath", "anotherLabel" ) );
	assert.strictEqual( getSelectionLabel(), "FOO", "optionLabelPath changes selection label" );
	assert.deepEqual( getItemLabels(), [ "FOO", "BAR", "BAZ" ], "Updates item labels as well" );

	// change the optionValuePath
	run( () => set( context, "optionValuePath", "anotherValue" ) );
	assert.strictEqual( get( context, "value" ), 4, "optionValuePath changes value" );

	// update the value of the selected item
	run( () => set( content, "0.anotherValue", 123 ) );
	assert.strictEqual( get( context, "value" ), 123, "Item value change changes value" );

	// remove the selection from content
	run( () => content.removeAt( 0 ) );
	assert.strictEqual( get( context, "value" ), null, "Removing selection unsets value" );
	assert.strictEqual( getSelectionLabel(), "no selection", "Shows placeholder" );
	assert.deepEqual( getItemSelections(), [ false, false ], "Removes items" );

	// add new items to content
	run( () => content.pushObject({ anotherValue: 1000, anotherLabel: "qux" }) );
	assert.strictEqual( getSelectionLabel(), "no selection", "Still shows placeholder" );
	assert.deepEqual( getItemSelections(), [ false, false, false ], "Added items are unselected" );
	run( () => set( context, "value", 1000 ) );
	assert.strictEqual( getSelectionLabel(), "qux", "Shows label of new item" );
	assert.deepEqual( getItemSelections(), [ false, false, true ], "Finds and selects new item" );

});


test( "Custom template block", assert => {

	const content = [
		{
			id: 1,
			label: "foo"
		},
		{
			id: 2,
			label: "bar"
		}
	];

	context = Component.extend({
		content,
		value: 2,
		layout: compile( `
			{{~#drop-down value=value content=content as |item|~}}",
				<li
					class="{{if item.selected 'selected'}}"
					{{action item.action}}
				>{{item.label}}: {{item.value}}</li>
			{{~/drop-down~}}
		` )
	}).create();
	setOwner( context, owner );
	runAppend( context );

	const $elem = getElem( context, ".drop-down-component" );
	const getSelectionLabel = () => $elem
		.children( ".drop-down-component-selection" )
		.text();
	const getItems = () => $elem
		.find( "> .drop-down-component-list > li" );
	const getItemLabels = () => getItems()
		.map( ( _, item ) => $( item ).text() )
		.toArray();
	const getItemSelections = () => getItems()
		.map( ( _, item ) => $( item ).hasClass( "selected" ) )
		.toArray();

	// initial rendering
	assert.strictEqual( getSelectionLabel(), "bar", "Shows initial selection label" );
	assert.deepEqual( getItemSelections(), [ false, true ], "Yields item selections" );
	assert.deepEqual( getItemLabels(), [ "foo: 1", "bar: 2" ], "Yields item labels and values" );

	// click
	run( () => getItems().eq( 0 ).click() );
	assert.strictEqual( getSelectionLabel(), "foo", "Updates selection label" );
	assert.deepEqual( getItemSelections(), [ true, false ], "Updates selections on click" );

});


test( "Expand, collapse and disable", assert => {

	const $main = $( "<main>" ).appendTo( fixtureElement );

	const content = new EmberNativeArray([
		{
			id: 1,
			label: "foo"
		},
		{
			id: 2,
			label: "bar"
		},
		{
			id: 3,
			label: "baz"
		}
	]);

	context = DropDownComponent.extend({
		hotkey: service(),
		keyUp( e ) {
			return get( this, "hotkey" ).trigger( e );
		}
	}).create({
		content,
		value: 2
	});
	setOwner( context, owner );
	runAppend( context, $main[ 0 ] );

	let clickListener;
	const $elem = context.$();
	const body = context.element.ownerDocument.body;
	const $selection = $elem.children( ".drop-down-component-selection" );
	const getItems = () => $elem
		.find( "> .drop-down-component-list > li" );
	const getItemSelections = () => getItems()
		.map( ( _, item ) => $( item ).hasClass( "selected" ) )
		.toArray();

	const checkListener = ( $elem, event, listener ) => {
		const events = $._data( body, "events" );
		if ( events ) {
			const listeners = events[ event ];
			if ( listeners ) {
				return listeners.some( obj => obj.handler === listener );
			}
		}
		return false;
	};

	// initial state
	assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded initially" );
	assert.notOk( $elem.hasClass( "disabled" ), "Is not disabled initially" );
	assert.notOk( !!context._clickListener, "Doesn't have a _clickListener" );

	// expand by clicking
	run( () => $selection.click() );
	clickListener = context._clickListener;
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded after clicking it" );
	assert.ok( !!context._clickListener, "Does have a _clickListener" );
	assert.ok(
		checkListener( $elem, "click", context._clickListener ),
		"_clickListener is registered on the document body"
	);

	// collapse by clicking an item
	run( () => getItems().eq( 1 ).click() );
	assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded when clicking an item" );
	assert.notOk( !!context._clickListener, "Doesn't have a _clickListener" );
	assert.notOk(
		checkListener( $elem, "click", clickListener ),
		"_clickListener is not registered on the document body anymore"
	);

	// collapse by clicking an external node
	run( () => set( context, "_isExpanded", true ) );
	clickListener = context._clickListener;
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( !!context._clickListener, "Does have a _clickListener" );
	assert.ok(
		checkListener( $elem, "click", context._clickListener ),
		"_clickListener is registered on the document body"
	);

	run( () => $( body ).click() );
	assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded when clicking the document body" );
	assert.notOk( !!context._clickListener, "Doesn't have a _clickListener" );
	assert.notOk(
		checkListener( $elem, "click", clickListener ),
		"_clickListener is not registered on the document body anymore"
	);

	// collapse by hotkey
	[ "Escape", "Backspace" ].forEach( code => {
		run( () => set( context, "_isExpanded", true ) );
		const clickListener = context._clickListener;
		assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
		assert.ok( !!context._clickListener, "Does have a _clickListener" );
		assert.ok(
			checkListener( $elem, "click", context._clickListener ),
			"_clickListener is registered on the document body"
		);

		run( () => {
			const e = $.Event( "keyup" );
			e.code = code;
			$elem.trigger( e );
		});
		assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded after pressing the hotkey" );
		assert.notOk( !!context._clickListener, "Doesn't have a _clickListener" );
		assert.notOk(
			checkListener( $elem, "click", clickListener ),
			"_clickListener is not registered on the document body anymore"
		);
	});

	// disable the DropDownComponent
	run( () => set( context, "_isExpanded", true ) );
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	run( () => set( context, "disabled", true ) );
	assert.ok( $elem.hasClass( "disabled" ), "Is disabled now" );
	assert.strictEqual( $selection.text(), "bar", "Has a selection label" );

	run( () => getItems().eq( 0 ).click() );
	assert.strictEqual( get( context, "value" ), 2, "Can't click items while being disabled" );
	assert.strictEqual( $selection.text(), "bar", "Selection label doesn't update" );
	assert.deepEqual( getItemSelections(), [ false, true, false ], "Keeps item selections" );

	run( () => $selection.click() );
	assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded anymore" );
	run( () => $selection.click() );
	assert.notOk( $elem.hasClass( "expanded" ), "Clicking again doesn't expand" );

	// component destruction
	run( () => set( context, "disabled", false ) );
	assert.notOk( $elem.hasClass( "disabled" ), "Is not disabled anymore" );
	run( () => set( context, "_isExpanded", true ) );
	clickListener = context._clickListener;
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( !!clickListener, "Does have a _clickListener" );
	assert.ok(
		checkListener( $elem, "click", clickListener ),
		"_clickListener is registered on the document body"
	);
	runDestroy( context );
	assert.notOk(
		checkListener( $elem, "click", clickListener ),
		"Removes _clickListener after destroying the component"
	);

	$main.remove();

});


test( "Hotkeys", assert => {

	let e;

	const content = [
		{
			id: 1,
			label: "foo"
		},
		{
			id: 2,
			label: "bar"
		},
		{
			id: 3,
			label: "baz"
		}
	];

	context = Component.extend({
		content,
		value: 1,
		layout: compile( "{{drop-down value=value content=content}}" ),

		hotkey: service(),
		keyUp( e ) {
			return get( this, "hotkey" ).trigger( e );
		}
	}).create();
	setOwner( context, owner );
	runAppend( context );

	const $context = context.$();
	const $elem = $context.find( ".drop-down-component" );

	const trigger = code => run( () => {
		e = $.Event( "keyup" );
		e.code = code;
		$context.trigger( e );
	});

	assert.strictEqual( get( context, "value" ), 1, "Value is 1 initially" );
	assert.notOk( $elem.hasClass( "expanded" ), "Is not expanded initially" );
	assert.strictEqual( $elem.attr( "tabindex" ), "0", "Has a tabindex attribute with value 0" );

	trigger( "Space" );
	assert.notOk( $elem.hasClass( "expanded" ), "Does not react to spacebar when not focused" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );
	trigger( "ArrowDown" );
	assert.strictEqual( get( context, "value" ), 1, "Doesn't change value on ArrowDown" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );
	trigger( "ArrowUp" );
	assert.strictEqual( get( context, "value" ), 1, "Doesn't change value on ArrowUp" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	// focus
	$elem.focus();

	trigger( "ArrowDown" );
	assert.strictEqual( get( context, "value" ), 1, "Needs expanded list on ArrowDown" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );
	trigger( "ArrowUp" );
	assert.strictEqual( get( context, "value" ), 1, "Needs expanded list on ArrowUp" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isImmediatePropagationStopped(), "Doesn't stop event's propagation" );

	trigger( "Space" );
	assert.ok( $elem.hasClass( "expanded" ), "Toggles expansion when focused on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	trigger( "Space" );
	assert.notOk( $elem.hasClass( "expanded" ), "Toggles expansion when focused on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );

	trigger( "Space" );

	trigger( "ArrowDown" );
	assert.strictEqual( get( context, "value" ), 2, "Changes value to next one on ArrowDown" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	trigger( "ArrowDown" );
	assert.strictEqual( get( context, "value" ), 3, "Changes value to next one on ArrowDown" );
	trigger( "ArrowDown" );
	assert.strictEqual( get( context, "value" ), 1, "Jumps to first one on ArrowDown" );

	trigger( "ArrowUp" );
	assert.strictEqual( get( context, "value" ), 3, "Jumps to last one on ArrowUp" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isImmediatePropagationStopped(), "Stops event's propagation" );
	trigger( "ArrowUp" );
	assert.strictEqual( get( context, "value" ), 2, "Changes value to previous one on ArrowUp" );
	trigger( "ArrowUp" );
	assert.strictEqual( get( context, "value" ), 1, "Changes value to previous one on ArrowUp" );

	trigger( "Escape" );
	assert.notOk( $elem.hasClass( "expanded" ), "Collapses list on Escape" );
	assert.strictEqual( document.activeElement, $elem[0], "Doesn't remove focus on Escape" );
	trigger( "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on Escape" );

});


test( "Expand upwards", assert => {

	const $main = $( "<main>" )
		.css({
			// let this be the offsetParent
			position: "relative",
			height: "1000px"
		})
		.append( $( "<style>" ).text( `
			.drop-down-component,
			.drop-down-component-list > li {
				height: 100px;
			}
		` ) )
		.appendTo( fixtureElement );
	const $buffer = $( "<div>" ).css({ height: 0 }).appendTo( $main );

	const content = new EmberNativeArray([
		{
			id: 1,
			label: "foo"
		},
		{
			id: 2,
			label: "bar"
		},
		{
			id: 3,
			label: "baz"
		}
	]);

	context = DropDownComponent.create({
		content,
		value: 2
	});
	setOwner( context, owner );
	runAppend( context, $main[ 0 ] );

	const $elem = context.$();
	const $selection = $elem.children( ".drop-down-component-selection" );

	assert.strictEqual( context._offsetParent, $main[ 0 ], "Has the correct offsetParent" );

	run( () => $selection.click() );
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	assert.notOk( $elem.hasClass( "expanded-upwards" ), "Is not expanded upwards" );
	run( () => $selection.click() );

	$buffer.css({ height: 700 });
	run( () => $selection.click() );
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	assert.notOk( $elem.hasClass( "expanded-upwards" ), "Is not expanded upwards" );
	run( () => $selection.click() );

	$buffer.css({ height: 701 });
	run( () => $selection.click() );
	assert.ok( $elem.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( $elem.hasClass( "expanded-upwards" ), "Is expanded upwards" );
	run( () => $selection.click() );

	$main.remove();

});
