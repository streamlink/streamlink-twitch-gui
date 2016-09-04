import {
	module,
	test
} from "QUnit";
import {
	runAppend,
	runDestroy,
	getElem,
	buildOwner,
	fixtureElement
} from "Testutils";
import {
	get,
	set,
	setOwner,
	run,
	EventDispatcher
} from "Ember";
import NumberFieldComponent from "components/form/NumberFieldComponent";


let eventDispatcher, owner, context;


module( "NumberFieldComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:number-field", NumberFieldComponent );
	},

	afterEach() {
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Value test", function( assert ) {

	context = NumberFieldComponent.create({
		value: 123
	});
	setOwner( context, owner );
	runAppend( context );


	assert.strictEqual(
		getElem( context, "input" ).val(),
		"123",
		"The input element has a value"
	);

	run(function() {
		set( context, "value", 100 );
	});
	assert.strictEqual(
		getElem( context, "input" ).val(),
		"100",
		"Changing the value directly"
	);

	run(function() {
		let elem = getElem( context, "input" );
		elem.val( "0" );
		elem.blur();
	});
	assert.strictEqual(
		get( context, "value" ),
		0,
		"Changing the value via the input field"
	);

});


test( "Invalid value test", function( assert ) {

	context = NumberFieldComponent.create({
		value: 123
	});
	setOwner( context, owner );
	runAppend( context );


	run(function() {
		set( context, "value", "foo" );
	});
	assert.strictEqual(
		get( context, "value" ),
		123,
		"Check for invalid values"
	);

	run(function() {
		let elem = getElem( context, "input" );
		elem.val( "bar" );
		elem.blur();
	});
	assert.strictEqual(
		get( context, "value" ),
		123,
		"Check for invalid input values"
	);

});


test( "Increase and decrease buttons", function( assert ) {

	context = NumberFieldComponent.create();
	setOwner( context, owner );
	runAppend( context );


	run(function() {
		getElem( context, ".spin-button-increase" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		1,
		"Increase button click increases value by one"
	);

	run(function() {
		getElem( context, ".spin-button-decrease" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		0,
		"Decrease button click decreases value by one"
	);

});


test( "disabled or readOnly", function( assert ) {

	context = NumberFieldComponent.create({
		value: 0,
		disabled: true
	});
	setOwner( context, owner );
	runAppend( context );

	run(function() {
		getElem( context, ".spin-button-increase" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		0,
		"Can't increase values of disabled number fields"
	);

	run(function() {
		getElem( context, ".spin-button-decrease" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		0,
		"Can't decrease values of disabled number fields"
	);

});


test( "Min/max values", function( assert ) {

	context = NumberFieldComponent.create({
		value: 2,
		min: 1,
		max: 3
	});
	setOwner( context, owner );
	runAppend( context );

	run(function() {
		set( context, "value", 4 );
	});
	assert.strictEqual(
		get( context, "value" ),
		3,
		"Can't set values above the defined maximum"
	);

	run(function() {
		set( context, "value", 0 );
	});
	assert.strictEqual(
		get( context, "value" ),
		1,
		"Can't set values below the defined minimum"
	);

	run(function() {
		set( context, "value", 3 );
		getElem( context, ".spin-button-increase" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		3,
		"The increase button respects the maximum as well"
	);

	run(function() {
		set( context, "value", 1 );
		getElem( context, ".spin-button-decrease" ).click();
	});
	assert.strictEqual(
		get( context, "value" ),
		1,
		"The decrease button respects the minimum as well"
	);

});
