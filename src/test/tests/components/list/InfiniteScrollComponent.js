import {
	module,
	test
} from "QUnit";
import {
	runAppend,
	runDestroy,
	getElem,
	getOutput,
	buildOwner,
	fixtureElement
} from "Testutils";
import {
	get,
	setOwner,
	$,
	HTMLBars,
	run,
	EmberNativeArray,
	Component,
	EventDispatcher
} from "Ember";
import InfiniteScrollComponent from "components/list/InfiniteScrollComponent";


const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/list/InfiniteScrollComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:infinite-scroll", InfiniteScrollComponent );
		owner.register( "component:loading-spinner", Component.extend({}) );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Buttons states", function( assert ) {

	context = Component.extend({
		layout: compile([
			"{{infinite-scroll",
			"content=content",
			"isFetching=isFetching",
			"hasFetchedAll=hasFetchedAll",
			"fetchError=fetchError",
			"action=action}}"
		].join( " " ) ),
		content: [],
		isFetching: false,
		hasFetchedAll: false,
		fetchError: false,
		action() {}
	}).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal( getOutput( context ).trim(), "Fetch more", "Initial state" );
	assert.equal( getElem( context, "button" ).attr( "disabled" ), undefined, "No disabled attr" );

	run( context, "setProperties", {
		isFetching: true,
		hasFetchedAll: false,
		fetchError: false
	});
	assert.equal( getOutput( context ).trim(), "Loading", "Loading state" );
	assert.equal( getElem( context, "button" ).attr( "disabled" ), "disabled", "Disabled attr" );

	run( context, "setProperties", {
		isFetching: false,
		hasFetchedAll: false,
		fetchError: true
	});
	assert.equal( getOutput( context ).trim(), "Error", "Error state" );

	run( context, "setProperties", {
		isFetching: false,
		hasFetchedAll: true,
		fetchError: false
	});
	assert.equal( getElem( context, "button" ).is( ":visible" ), true, "Hide when hasFetchedALl" );

});


test( "Clicks", function( assert ) {

	//noinspection JSUnusedAssignment
	let callbackValue = null;
	context = Component.extend({
		layout: compile([
			"{{infinite-scroll",
			"content=content",
			"isFetching=isFetching",
			"hasFetchedAll=hasFetchedAll",
			"fetchError=fetchError",
			"action=action}}"
		].join( " " ) ),
		content: [],
		isFetching: false,
		hasFetchedAll: false,
		fetchError: false,
		action( value ) {
			callbackValue = value;
		}
	}).create();
	setOwner( context, owner );

	runAppend( context );

	getElem( context, "button" ).click();
	assert.strictEqual( callbackValue, true, "Triggers action when clicking while not loading" );
	callbackValue = null;

	run( context, "setProperties", {
		isFetching: true
	});
	getElem( context, "button" ).click();
	assert.strictEqual( callbackValue, null, "Doesn't trigger action when clicking while loading" );

});


test( "Non-default parent element", function( assert ) {

	let $scrollParent = $( "<div>" ).css({
		height: 100,
		overflowY: "auto"
	}).appendTo( fixtureElement );
	let $scrollChild = $( "<div>" ).css({
		height: 1000
	}).appendTo( $scrollParent[0] );

	context = InfiniteScrollComponent.create();
	setOwner( context, owner );

	runAppend( context, $scrollChild[0] );

	assert.strictEqual(
		get( context, "$parent" )[0],
		$scrollParent[0],
		"Finds the correct parent element with a scroll bar"
	);

	// clean up manually
	runDestroy( context );
	$scrollChild.remove();
	$scrollParent.remove();

});


test( "Event listeners", function( assert ) {

	let $main = $( "<main>" ).addClass( "content" ).appendTo( fixtureElement );

	context = InfiniteScrollComponent.create();
	setOwner( context, owner );

	runAppend( context, $main[0] );

	assert.equal(
		get( context, "$parent" )[0],
		$main[0],
		"Finds the default parent element"
	);

	let listener = get( context, "listener" );
	function checkListener( elem, event ) {
		if ( $._data( elem, "events" )[ event ].findBy( "handler", listener ) ) {
			return true;
		}
		throw new Error( "Missing event listener" );
	}

	assert.ok(
		checkListener( $main[0], "scroll" ),
		"Parent element has a scroll listener"
	);
	assert.ok(
		checkListener( window, "resize" ),
		"Window element has a resize listener"
	);

	// clean up manually
	runDestroy( context );

	assert.throws(
		() => checkListener( $main[0], "scroll" ),
		"Parent element's scroll listener has been removed"
	);
	assert.throws(
		() => checkListener( window, "resize" ),
		"Window element's resize listener has been removed"
	);

	$main.remove();

});


test( "Scroll listener", function( assert ) {

	let viewHeight = 100;
	let elemHeight = 1000;

	let $scrollParent = $( "<div>" ).css({
		height: viewHeight,
		overflowY: "auto"
	}).appendTo( fixtureElement );
	let $scrollChild = $( "<div>" ).css({
		height: elemHeight
	}).appendTo( $scrollParent[0] );
	//noinspection JSUnusedAssignment
	let callbackValue = null;

	context = InfiniteScrollComponent.create({
		action( value ) {
			callbackValue = value;
		}
	});
	setOwner( context, owner );

	runAppend( context, $scrollChild[0] );

	// 2 / 3
	let threshold = get( context, "threshold" );
	let scrollTop = Math.floor( ( elemHeight - viewHeight ) - ( threshold * viewHeight ) );

	$scrollParent[0].scrollTop = scrollTop;
	$scrollParent.scroll();
	assert.strictEqual( callbackValue, null, "Doesn't trigger action if below scroll threshold" );

	$scrollParent[0].scrollTop = scrollTop + 1;
	$scrollParent.scroll();
	assert.strictEqual( callbackValue, false, "Triggers action if above scroll threshold" );

	// clean up manually
	runDestroy( context );
	$scrollChild.remove();
	$scrollParent.remove();

});


test( "Call listener on content reduction", function( assert ) {

	let content = new EmberNativeArray([ 1, 2, 3 ]);
	//noinspection JSUnusedAssignment
	let called = false;

	context = InfiniteScrollComponent.create({
		content,
		infiniteScroll() {
			called = true;
		}
	});
	setOwner( context, owner );

	runAppend( context );

	assert.strictEqual( called, false, "Don't initially trigger the event listener" );

	run(function() {
		content.removeAt( 0 );
	});
	assert.strictEqual( called, true, "Trigger the listener after elements have been removed" );

});
