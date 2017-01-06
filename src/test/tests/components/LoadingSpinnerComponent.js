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
	setOwner,
	HTMLBars,
	Component,
	EventDispatcher
} from "Ember";
import LoadingSpinnerComponent from "components/LoadingSpinnerComponent";


const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/LoadingSpinnerComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:loading-spinner", LoadingSpinnerComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "LoadingSpinnerComponent", assert => {

	context = Component.extend({
		layout: compile( "{{loading-spinner}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	const $elem = getElem( context, "svg.loading-spinner-component" );

	assert.ok(
		$elem.get( 0 ) instanceof SVGElement,
		"Finds the loading spinner"
	);

	assert.notEqual(
		$elem.eq( 0 ).attr( "viewBox" ),
		undefined,
		"SVG element has a viewBox attribute"
	);

	assert.notEqual(
		$elem.find( "circle" ).eq( 0 ).attr( "r" ),
		undefined,
		"Circle has a radius attribute"
	);

});
