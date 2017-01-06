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
	$,
	HTMLBars,
	run,
	Component,
	EventDispatcher
} from "Ember";
import SettingsSubmitComponent from "components/SettingsSubmitComponent";


const { later } = run;
const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/SettingsSubmitComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:settings-submit", SettingsSubmitComponent );
		owner.register( "component:form-button", Component.extend({}) );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Basic isDirty and disabled states", assert => {

	context = Component.extend({
		isDirty: false,
		disabled: false,
		layout: compile( "{{settings-submit isDirty=isDirty disabled=disabled}}" ),
	}).create();
	setOwner( context, owner );

	runAppend( context );

	const $elem = getElem( context, ".settings-submit-component" );
	assert.ok(
		$elem.hasClass( "faded" ),
		"Is faded in its default state"
	);

	run( () => set( context, "isDirty", true ) );
	assert.ok(
		!$elem.hasClass( "faded" ),
		"Is not faded when isDirty"
	);

	run( () => set( context, "disabled", true ) );
	assert.ok(
		$elem.hasClass( "faded" ),
		"Is faded when disabled"
	);

	run( () => set( context, "disabled", false ) );
	assert.ok(
		!$elem.hasClass( "faded" ),
		"Is not faded anymore when re-enabled"
	);

});


test( "Delayed fading", assert => {

	const done = assert.async();
	const delay = 1;

	const $parent = $( "<div>" ).appendTo( fixtureElement );

	context = SettingsSubmitComponent.create({
		isDirty: true,
		disabled: false,
		delay
	});
	setOwner( context, owner );
	runAppend( context, $parent );

	assert.strictEqual(
		get( context, "_enabled" ),
		true,
		"Is not faded initially"
	);
	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer"
	);

	run( () => set( context, "isDirty", false ) );

	assert.strictEqual(
		get( context, "_enabled" ),
		true,
		"Is still not faded"
	);
	assert.notStrictEqual(
		context._timeout,
		null,
		"Does have a timer now"
	);

	later( () => {
		run( () => {
			assert.strictEqual(
				get( context, "_enabled" ),
				false,
				"Is faded after the delay"
			);
			assert.strictEqual(
				context._timeout,
				null,
				"Does not have a timer anymore"
			);

			// clean up manually
			runDestroy( context );
			$parent.remove();

			done();
		});
	}, delay );

});



test( "Delayed cancelled fading", assert => {

	const done = assert.async();
	const delay = 1;

	const $parent = $( "<div>" ).appendTo( fixtureElement );

	context = SettingsSubmitComponent.create({
		isDirty: true,
		disabled: false,
		delay
	});
	setOwner( context, owner );
	runAppend( context, $parent );

	assert.strictEqual(
		get( context, "_enabled" ),
		true,
		"Is not faded initially"
	);
	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer"
	);

	run( () => set( context, "isDirty", false ) );

	assert.strictEqual(
		get( context, "_enabled" ),
		true,
		"Is still not faded"
	);
	assert.notStrictEqual(
		context._timeout,
		null,
		"Does have a timer now"
	);

	run( () => set( context, "isDirty", true ) );

	assert.strictEqual(
		get( context, "_enabled" ),
		true,
		"Is not faded"
	);
	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer"
	);

	later( () => {
		run( () => {
			assert.strictEqual(
				get( context, "_enabled" ),
				true,
				"Is still not faded"
			);

			// clean up manually
			runDestroy( context );
			$parent.remove();

			done();
		});
	}, delay );

});
