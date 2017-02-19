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
	computed,
	run,
	Component,
	EventDispatcher
} from "Ember";
import followButtonComponentInjector
	from "inject?mixins/TwitchInteractButtonMixin!components/button/FollowButtonComponent";
import FormButtonComponent from "components/button/FormButtonComponent";
import BoolNotHelper from "helpers/BoolNotHelper";


const { alias } = computed;
const { later } = run;


let eventDispatcher, owner, context;

const LoadingSpinnerComponent = Component.extend({
	classNames: [ "loading-spinner-component" ]
});
const FollowButtonComponent = followButtonComponentInjector({
	"mixins/TwitchInteractButtonMixin": { "default": {} }
})[ "default" ];


module( "components/button/FollowButtonComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "helper:bool-not", BoolNotHelper );
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


test( "Loading/success states and click actions", assert => {

	//noinspection JSUnusedAssignment
	let lastActionCalled = null;

	context = FollowButtonComponent.extend({
		isLocked: alias( "isLoading" ),
		actions: {
			expand() {
				//noinspection JSUnusedAssignment
				lastActionCalled = "expand";
				return this._super( ...arguments );
			},

			collapse() {
				//noinspection JSUnusedAssignment
				lastActionCalled = "collapse";
				return this._super( ...arguments );
			},

			follow() {
				//noinspection JSUnusedAssignment
				lastActionCalled = "follow";
				// stub original behavior
				set( this, "isSuccessful", true );
			},

			unfollow() {
				//noinspection JSUnusedAssignment
				lastActionCalled = "unfollow";
				// stub original behavior
				set( this, "isSuccessful", false );
				this.collapse();
			}
		}
	}).create({
		name: "foo",
		isSuccessful: false,
		isLoading: true
	});

	setOwner( context, owner );
	runAppend( context );

	let $followButton = getElem( context );
	let $mainButton = $followButton.find( ".form-button-component:not(.confirm-button)" );
	let $confirmButton = $followButton.find( ".form-button-component.confirm-button" );


	// loading

	assert.ok(
		   $followButton.get( 0 ) instanceof HTMLDivElement
		&& $mainButton.get( 0 ) instanceof HTMLElement
		&& $confirmButton.get( 0 ) instanceof HTMLElement,
		"Renders the component correctly"
	);

	assert.ok(
		!$followButton.hasClass( "expanded" ),
		"Is not expanded initially"
	);

	assert.ok(
		$followButton.find( ".loading-spinner-component" ).get( 0 ) instanceof HTMLElement,
		"Shows the loading spinner while loading"
	);

	assert.ok(
		$mainButton.hasClass( "btn-info" ),
		"Main button has the btn-info class while loading"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"",
		"Main button doesn't have a title while loading"
	);

	$mainButton.click();
	$confirmButton.click();
	assert.strictEqual(
		lastActionCalled,
		null,
		"No actions are being called when clicking any button while loading"
	);


	// loaded: not following

	run( () => set( context, "isLoading", false ) );

	assert.strictEqual(
		$followButton.find( ".loading-spinner-component" ).length,
		0,
		"Doesn't show the loading spinner anymore after finishing loading"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-danger" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart-o" ),
		"When not following, the main button is red with an empty heart icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"Follow foo",
		"The main button has the correct title when not following"
	);

	$confirmButton.click();
	assert.strictEqual(
		lastActionCalled,
		null,
		"The confirm button does not have an action while not being expanded"
	);

	run( () => $mainButton.click() );
	assert.strictEqual(
		lastActionCalled,
		"follow",
		"Follow action was called when clicking while not following"
	);
	lastActionCalled = null;


	// now following

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart" ),
		"When following, the main button is green with a filled heart icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"Unfollow foo",
		"The main button has the correct title when following"
	);

	$confirmButton.click();
	assert.strictEqual(
		lastActionCalled,
		null,
		"The confirm button does not have an action while not being expanded"
	);
	lastActionCalled = null;


	// expand

	run( () => $mainButton.click() );

	assert.strictEqual(
		lastActionCalled,
		"expand",
		"Expand action was called when clicking while following"
	);
	lastActionCalled = null;

	assert.ok(
		$followButton.hasClass( "expanded" ),
		"Component has the expanded class when clicking the main button while following"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"While being expanded, the main button is green and has the arrow left icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"Keep following foo",
		"The main button has the correct title when being expanded"
	);

	assert.strictEqual(
		$confirmButton.prop( "title" ),
		"Unfollow foo",
		"The confirm button has the correct title when being expanded"
	);

	assert.ok(
		   $confirmButton.hasClass( "btn-danger" )
		&& $confirmButton.find( "i" ).hasClass( "fa-heart-o" ),
		"While being expanded, the confirm button is red and has an empty heart icon"
	);


	// unfollow

	run( () => $confirmButton.click() );

	assert.strictEqual(
		lastActionCalled,
		"unfollow",
		"Unfollow action was called when clicking the confirm button in expanded state"
	);
	lastActionCalled = null;

	assert.ok(
		!$followButton.hasClass( "expanded" ),
		"The confirm button fades out when clicking it"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"The main button is still green and has the arrow left icon until the transition completes"
	);

	run( () => $confirmButton.trigger( "webkitTransitionEnd" ) );

	assert.ok(
		   $mainButton.hasClass( "btn-danger" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart-o" ),
		"When the transition completes, the main button is red with an empty heart icon again"
	);


	// collapse (from expanded state again)

	run( () => {
		set( context, "isSuccessful", true );
		context.expand();
	});

	$mainButton.click();
	assert.strictEqual(
		lastActionCalled,
		"collapse",
		"Collapse action was called when clicking the main button in expanded state"
	);
	lastActionCalled = null;

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"The main button is still green and has the arrow left icon until the transition completes"
	);

	run( () => $confirmButton.trigger( "webkitTransitionEnd" ) );

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart" ),
		"When the transition completes, the main button is green with a filled heart icon again"
	);

});


test( "Mouseenter and mouseleave", assert => {

	const done = assert.async();

	context = FollowButtonComponent.create({
		isSuccessful: true,
		mouseLeaveTime: 1
	});

	setOwner( context, owner );
	runAppend( context );

	let $elem = getElem( context );


	// initial state

	assert.ok(
		   get( context, "isExpanded" ) === false
		&& get( context, "isPromptVisible" ) === false,
		"Prompt is hidden initially"
	);

	run( () => $elem.trigger( "mouseleave" ) );

	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer when leaving and not expanded"
	);


	// expand

	run( () => context.expand() );

	assert.ok(
		   get( context, "isExpanded" ) === true
		&& get( context, "isPromptVisible" ) === true,
		"Prompt is visible when expanded"
	);

	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer"
	);


	// leave and re-enter before transition

	run( () => $elem.trigger( "mouseleave" ) );

	assert.ok(
		   get( context, "isExpanded" ) === true
		&& get( context, "isPromptVisible" ) === true,
		"Prompt is still visible immediately after leaving"
	);

	assert.notStrictEqual(
		context._timeout,
		null,
		"Does have a timer when leaving"
	);

	run( () => $elem.trigger( "mouseenter" ) );

	assert.ok(
		   get( context, "isExpanded" ) === true
		&& get( context, "isPromptVisible" ) === true,
		"Prompt is still visible when re-entering before the transition"
	);
	assert.strictEqual(
		context._timeout,
		null,
		"Does not have a timer anymore"
	);


	// leave and re-enter during transition

	run( () => $elem.trigger( "mouseleave" ) );

	assert.notStrictEqual(
		context._timeout,
		null,
		"Does have a timer before the transition"
	);

	later( () => {

		assert.ok(
			   get( context, "isExpanded" ) === false
			&& get( context, "isPromptVisible" ) === true,
			"The prompt is fading out after the set time when leaving"
		);

		assert.strictEqual(
			context._timeout,
			null,
			"Does not have a timer during the transition"
		);

		run( () => $elem.trigger( "mouseenter" ) );

		assert.ok(
			   get( context, "isExpanded" ) === true
			&& get( context, "isPromptVisible" ) === true,
			"Prompt is not fading anymore when re-entering during transition"
		);

		assert.strictEqual(
			context._timeout,
			null,
			"Does not have a timer after re-entering"
		);


		// leave

		run( () => $elem.trigger( "mouseleave" ) );

		later( () => {

			assert.ok(
				   get( context, "isExpanded" ) === false
				&& get( context, "isPromptVisible" ) === true,
				"The prompt is fading out after the set time when leaving"
			);

			assert.strictEqual(
				context._timeout,
				null,
				"There is no timer during the transition"
			);

			run( () => context.$confirmbutton.trigger( "webkitTransitionEnd" ) );

			assert.ok(
				   get( context, "isExpanded" ) === false
				&& get( context, "isPromptVisible" ) === false,
				"When the transition completes, the prompt is hidden"
			);

			done();
		}, 2 );
	}, 2 );

});


test( "Logged out", assert => {

	context = FollowButtonComponent.extend({
		isValid: true
	}).create();

	setOwner( context, owner );
	runAppend( context );

	let $followButton = getElem( context );

	assert.ok( $followButton.is( ":visible" ), "Is visible while being logged in" );

	run( () => set( context, "isValid", false ) );

	assert.ok( !$followButton.is( ":visible" ), "Is not visible while being logged out" );

});
