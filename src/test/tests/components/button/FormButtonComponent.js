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
	set,
	setOwner,
	HTMLBars,
	run,
	Component,
	EventDispatcher
} from "Ember";
import FormButtonComponent, {
	STATE_SUCCESS,
	STATE_FAILURE
} from "components/button/FormButtonComponent";


const { compile } = HTMLBars;

const LoadingSpinnerComponent = Component.extend({
	tagName: "i",
	classNames: "loading-spinner-component"
});


let eventDispatcher, owner, context;


module( "components/button/FormButtonComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:loading-spinner", LoadingSpinnerComponent );
		owner.register( "component:form-button", FormButtonComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Basic attributes", assert => {

	context = Component.extend({
		classNames: "foo",
		title: "bar",
		disabled: false,
		icon: "fa-times",
		layout: compile(
			"{{form-button classNames=classNames title=title disabled=disabled icon=icon}}"
		)
	}).create();
	setOwner( context, owner );

	runAppend( context );
	let $btn = getElem( context, ".form-button-component" );

	assert.ok(
		$btn.get( 0 ) instanceof HTMLButtonElement,
		"The button exists"
	);
	assert.ok(
		$btn.hasClass( "btn-icon" ) && !$btn.hasClass( "btn-with-icon" ),
		"Has non-block button icon class"
	);
	assert.ok(
		$btn.hasClass( "foo" ),
		"Has custom class name applied"
	);
	assert.strictEqual(
		$btn.attr( "title" ),
		"bar",
		"Has title attribute"
	);
	assert.strictEqual(
		$btn.attr( "disabled" ),
		undefined,
		"Is not disabled"
	);
	assert.ok(
		$btn.find( "i.fa" ).hasClass( "fa-times" ),
		"Has an icon with the correct class name"
	);

	run( () => set( context, "disabled", true ) );

	assert.strictEqual(
		$btn.attr( "disabled" ),
		"disabled",
		"Button is now disabled"
	);

});


test( "FormButtonComponent with block", assert => {

	context = Component.extend({
		layout: compile( "{{#form-button icon='fa-times'}}foo{{/form-button}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );
	let $btn = getElem( context, ".form-button-component" );

	assert.ok(
		$btn.hasClass( "btn-with-icon" ) && !$btn.hasClass( "btn-icon" ),
		"Has block button icon class"
	);
	assert.strictEqual(
		cleanOutput( context, ".form-button-component" ),
		"foo",
		"Has button content"
	);

});


test( "Click actions", assert => {

	let clicks = 0;
	context = Component.extend({
		actions: {
			action() {
				++clicks;
			}
		},
		layout: compile( "{{form-button action=(action 'action')}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );
	getElem( context, ".form-button-component" ).click();

	assert.strictEqual(
		clicks,
		1,
		"Executes click actions"
	);

});


test( "Icon animations", assert => {

	let success, failure;
	let successPromise, failurePromise;
	let successPromiseData = {};
	let failurePromiseData = {};

	context = Component.extend({
		actions: {
			action( _success, _failure ) {
				success = _success;
				failure = _failure;
			}
		},
		layout: compile(
			"{{form-button action=(action 'action') icon='fa-times' iconanim=true spinner=true}}"
		)
	}).create();
	setOwner( context, owner );

	runAppend( context );
	let $btn = getElem( context, ".form-button-component" );

	// click and succeed
	success = null;
	failure = null;
	$btn.click();

	assert.ok(
		$btn.hasClass( "btn-with-anim" ),
		"Has button animation class"
	);
	assert.ok(
		$btn.find( ".loading-spinner-component" ).get( 0 ) instanceof HTMLElement,
		"Is showing the loading spinner"
	);
	assert.ok(
		success instanceof Function && failure instanceof Function,
		"Action has success and failure callbacks"
	);

	// let the action succeed
	run( () => {
		successPromise = success( successPromiseData );
	});

	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner anymore"
	);
	assert.ok(
		$btn.find( "i.fa" ).hasClass( "anim-success" ),
		"Icon has the animation success class"
	);

	// let the animation end
	run( () => $btn.trigger( "webkitAnimationEnd" ) );

	assert.ok(
		!$btn.hasClass( "btn-with-anim" ),
		"Button does not have the animation class anymore"
	);
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner after the success callback has resolved"
	);
	assert.ok(
		!$btn.find( "i.fa" ).hasClass( "anim-success" ),
		"Icon does not have the animation success class anymore"
	);

	//noinspection JSUnusedAssignment
	successPromise.then( data => {
		assert.strictEqual( data, successPromiseData, "The success promise always resolves" );
	});

	// ----------

	// click and fail
	success = null;
	failure = null;
	$btn.click();

	assert.ok(
		$btn.hasClass( "btn-with-anim" ),
		"Has button animation class"
	);
	assert.ok(
		$btn.find( ".loading-spinner-component" ).get( 0 ) instanceof HTMLElement,
		"Is showing the loading spinner"
	);
	assert.ok(
		success instanceof Function && failure instanceof Function,
		"Action has success and failure callbacks"
	);

	// let the action fail
	run( () => {
		failurePromise = failure( failurePromiseData );
	});

	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner anymore"
	);
	assert.ok(
		$btn.find( "i.fa" ).hasClass( "anim-failure" ),
		"Icon has the animation failure class"
	);

	// let the animation end
	run( () => $btn.trigger( "webkitAnimationEnd" ) );

	assert.ok(
		!$btn.hasClass( "btn-with-anim" ),
		"Button does not have the animation class anymore"
	);
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner after the success callback has resolved"
	);
	assert.ok(
		!$btn.find( "i.fa" ).hasClass( "anim-failure" ),
		"Icon does not have the animation failure class anymore"
	);

	//noinspection JSUnusedAssignment
	failurePromise.catch( data => {
		assert.strictEqual( data, failurePromiseData, "The failure promise always rejects" );
	});

	//noinspection JSUnusedAssignment
	return Promise.all([
		successPromise,
		failurePromise.catch( () => {} )
	]);

});


test( "Click actions returning a Promise", assert => {

	let done = assert.async();
	let actionResult;

	context = FormButtonComponent.create({
		icon: "fa-times",
		iconanim: true,
		_iconAnimation() {},
		action() {
			//noinspection JSUnusedAssignment
			return actionResult();
		}
	});
	setOwner( context, owner );

	runAppend( context );

	actionResult = () => Promise.resolve();
	context._iconAnimation = state => {
		assert.strictEqual(
			state,
			STATE_SUCCESS,
			"Calls icon success animation callback"
		);

		actionResult = () => Promise.reject();
		context._iconAnimation = state => {
			assert.strictEqual(
				state,
				STATE_FAILURE,
				"Calls icon failure animation callback"
			);

			done();
		};

		context.click();
	};

	context.click();

});
