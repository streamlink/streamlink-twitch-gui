import {
	module,
	test
} from "QUnit";
import {
	runAppend,
	runDestroy,
	getElem,
	cleanOutput,
	buildOwner,
	fixtureElement
} from "Testutils";
import {
	get,
	set,
	setOwner,
	HTMLBars,
	run,
	Component,
	EventDispatcher
} from "Ember";
import CheckBoxComponent from "components/form/CheckBoxComponent";
import RadioBtnComponent from "components/form/RadioBtnComponent";
import RadioBtnsComponent from "components/form/RadioBtnsComponent";


const { compile } = HTMLBars;

const eventDispatcher = EventDispatcher.create();
eventDispatcher.setup( {}, fixtureElement );

let owner, context;


module( "InputBtnComponent", {
	"setup": function() {
		owner = buildOwner();
		owner.register( "component:check-box", CheckBoxComponent );
		owner.register( "component:radio-btn", RadioBtnComponent );
		owner.register( "component:radio-btns", RadioBtnsComponent );
	},

	"beforeEach": function() {
		owner.register( "event_dispatcher:main", eventDispatcher );
	},

	"afterEach": function() {
		owner.unregister( "event_dispatcher:main" );
		runDestroy( eventDispatcher );
		runDestroy( context );
	},

	"teardown": function() {
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


test( "RadioBtnsComponent - without block", function( assert ) {

	var content = [
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
	];

	context = Component.extend({
		content,
		value: 2,
		optionValuePath: "value",
		optionLabelPath: "label",
		layout: compile([
			"{{radio-btns ",
			"value=value ",
			"content=content ",
			"optionValuePath=optionValuePath ",
			"optionLabelPath=optionLabelPath}}"
		].join( "" ) )
	}).create();
	setOwner( context, owner );

	// initial
	runAppend( context );
	assert.equal(
		getElem( context, ".radio-btn-component" ).length,
		3,
		"All content items are rendered"
	);
	assert.deepEqual(
		[
			cleanOutput( context, ".radio-btn-component:eq(0)" ),
			cleanOutput( context, ".radio-btn-component:eq(1)" ),
			cleanOutput( context, ".radio-btn-component:eq(2)" )
		],
		[
			"foo",
			"bar",
			"baz"
		],
		"All RadioBtnComponents have labels"
	);
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			false,
			true,
			false
		],
		"Initial checked state on each RadioBtnComponent"
	);

	// set value to 3 in context
	run(function() {
		set( context, "value", 3 );
	});
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			false,
			false,
			true
		],
		"Each RadioBtnsComponent reacts to changes of the value attribute"
	);

	// click the first RadioBtnComponent
	run(function() {
		getElem( context, ".radio-btn-component:eq(0)" ).click();
	});
	assert.equal(
		get( context, "value" ),
		1,
		"First RadioBtnComponent was clicked. Value is 1 now"
	);
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			true,
			false,
			false
		],
		"All RadioBtnComponents are changed as well"
	);

	// disable the third RadioBtnComponent
	run(function() {
		set( content, "2.disabled", true );
	});
	assert.equal(
		getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "disabled" ),
		true,
		"The third RadioBtnComponent is now disabled"
	);

	// try to click the disabled RadioBtnComponent
	run(function() {
		getElem( context, ".radio-btn-component:eq(2)" ).click();
	});
	assert.equal(
		get( context, "value" ),
		1,
		"Disabled RadioBtnComponents can't be clicked. Value is still 1"
	);
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			true,
			false,
			false
		],
		"All RadioBtnComponents did not change"
	);

	// change the optionLabelPath
	run(function() {
		set( context, "optionLabelPath", "anotherLabel" );
	});
	assert.deepEqual(
		[
			cleanOutput( context, ".radio-btn-component:eq(0)" ),
			cleanOutput( context, ".radio-btn-component:eq(1)" ),
			cleanOutput( context, ".radio-btn-component:eq(2)" )
		],
		[
			"FOO",
			"BAR",
			"BAZ"
		],
		"optionLabelPath was changed. RadioBtnComponents have different labels now"
	);

	// change the optionValuePath
	run(function() {
		set( context, "optionValuePath", "anotherValue" );
	});
	assert.equal(
		get( context, "value" ),
		4,
		"optionValuePath was changed. The context's value is 4 now"
	);

	// update the selected button's value
	run(function() {
		set( content, "0.anotherValue", 123 );
	});
	assert.equal(
		get( context, "value" ),
		123,
		"Changing the selection RadioBtnComponent's value also changes the group's value"
	);
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			true,
			false,
			false
		],
		"The first RadioBtnComponent is still selected"
	);

	// remove the selected RadioBtnComponent
	run(function() {
		content.splice( 0, 1 );
		content.enumerableContentDidChange();
	});
	assert.equal(
		getElem( context, ".radio-btn-component" ).length,
		2,
		"The first button was removed"
	);
	assert.equal(
		get( context, "value" ),
		undefined,
		"The selected button was removed and the value is now undefined"
	);

	// add new items to the content list
	run(function() {
		content.pushObject({
			anotherValue: 1000,
			anotherLabel: "qux"
		});
	});
	assert.equal(
		getElem( context, ".radio-btn-component" ).length,
		3,
		"Items can be added to the list"
	);

	// set the context's value to something unknown
	run(function() {
		set( context, "value", 0 );
	});
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(2)" ).hasClass( "checked" )
		],
		[
			false,
			false,
			false
		],
		"All RadioBtnComponents are unchecked if setting the value to something unknown"
	);

});


test( "RadioBtnsComponent - with block", function( assert ) {

	var content = [
		{
			value: 1,
			label: "foo"
		},
		{
			value: 2,
			label: "bar"
		}
	];

	context = Component.extend({
		content,
		value: 2,
		layout: compile([
			"{{#radio-btns value=value content=content as |radiobtn label|}}",
			"<div>{{#component radiobtn}}{{label}}-{{label}}{{/component}}</div>",
			"{{/radio-btns}}"
		].join( "" ) )
	}).create();
	setOwner( context, owner );

	// initial
	runAppend( context );
	assert.equal(
		getElem( context, ".radio-btn-component" ).length,
		2,
		"All content items are rendered"
	);
	assert.deepEqual(
		getElem( context, ".radio-btns-component > div" ).length,
		2,
		"Custom block elements"
	);
	assert.deepEqual(
		[
			cleanOutput( context, ".radio-btn-component:eq(0)" ),
			cleanOutput( context, ".radio-btn-component:eq(1)" )
		],
		[
			"foo-foo",
			"bar-bar"
		],
		"Each RadioBtnComponent has a custom label"
	);
	assert.deepEqual(
		[
			getElem( context, ".radio-btn-component:eq(0)" ).hasClass( "checked" ),
			getElem( context, ".radio-btn-component:eq(1)" ).hasClass( "checked" )
		],
		[
			false,
			true
		],
		"All RadioBtnComponent have the correct checked state"
	);

});
