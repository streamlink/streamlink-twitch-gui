import {
	module,
	test
} from "qunit";
import {
	runAppend,
	runDestroy,
	cleanOutput,
	buildOwner
} from "test-utils";
import {
	setOwner,
	HTMLBars,
	run,
	Component,
	EmberNativeArray
} from "ember";
import ContentListComponent from "components/list/ContentListComponent";
import IsGteHelper from "helpers/IsGteHelper";
import GetIndexHelper from "helpers/GetIndexHelper";


const { compile } = HTMLBars;
const { scheduleOnce } = run;

let owner, context;


module( "components/list/ContentListComponent", {
	beforeEach() {
		owner = buildOwner();
		owner.register( "component:content-list", ContentListComponent );
		owner.register( "component:infinite-scroll", Component.extend() );
		owner.register( "helper:is-gte", IsGteHelper );
		owner.register( "helper:get-index", GetIndexHelper );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Empty content", function( assert ) {

	const content = new EmberNativeArray();
	const layout = compile(
		"{{#content-list content as |item|}}{{item}}{{else}}empty{{/content-list}}"
	);
	context = Component.extend({ content, layout }).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal( cleanOutput( context ), "empty", "Empty content" );

	run( () => content.pushObject( 1 ) );
	assert.equal( cleanOutput( context ), "1", "Non empty content" );

});


test( "New items", function( assert ) {

	const content = new EmberNativeArray([ 1, 2 ]);
	const layout = compile(
		"{{#content-list content as |item new|}}{{if new 'Y' 'N'}}{{/content-list}}"
	);
	context = Component.extend({ content, layout }).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal( cleanOutput( context ), "NN", "Initial content" );

	run( () => content.pushObjects([ 3, 4 ]) );
	assert.equal( cleanOutput( context ), "NNYY", "Unique items" );

});


test( "Duplicates", function( assert ) {

	const content = new EmberNativeArray([ 1, 2 ]);
	const layout = compile(
		"{{#content-list content as |item new dup|}}{{if dup 'Y' 'N'}}{{/content-list}}"
	);
	context = Component.extend({ content, layout }).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal( cleanOutput( context ), "NN", "Initial content" );

	run( () => content.pushObjects([ 2, 3 ]) );
	assert.equal( cleanOutput( context ), "NNYN", "2 is a duplicate" );

	run( () => content.pushObjects([ 1, 2, 3 ]) );
	assert.equal( cleanOutput( context ), "NNYNYYY", "1, 2 and 3 are duplicates" );

});


test( "Simple nested duplicates", function( assert ) {

	const content = new EmberNativeArray([ { data: 1 }, { data: 2 } ]);
	const layout = compile(
		"{{#content-list content 'data' as |item new dup|}}{{if dup 'Y' 'N'}}{{/content-list}}"
	);
	context = Component.extend({ content, layout }).create();
	setOwner( context, owner );

	runAppend( context );
	assert.equal( cleanOutput( context ), "NN", "Initial content" );

	run( () => content.pushObjects([ { data: 2 }, { data: 3 } ]) );
	assert.equal(
		cleanOutput( context ),
		"NNYN",
		"2 is a nested duplicate"
	);

	run( () => content.pushObjects([ { data: 1 }, { data: 2 }, { data: 3 } ]) );
	assert.equal(
		cleanOutput( context ),
		"NNYNYYY",
		"1, 2 and 3 are nested duplicates"
	);

});


test( "Deferred nested duplicates", function( assert ) {

	let resolveA, resolveB, resolveC;
	const A = new Promise( resolve => resolveA = resolve );
	const B = new Promise( resolve => resolveB = resolve );
	const C = new Promise( resolve => resolveC = resolve );

	const content = [ { data: Promise.resolve( 1 ) }, { data: Promise.resolve( 1 ) } ];
	const layout = compile(
		"{{#content-list content 'data' true as |item new dup|}}{{if dup 'Y' 'N'}}{{/content-list}}"
	);
	context = Component.extend({ content, layout }).create();
	setOwner( context, owner );

	const allResolvedAndRendered = () =>
		Promise.all( content.mapBy( "data" ) )
			.then( () =>
				new Promise( resolve =>
					scheduleOnce( "afterRender", resolve )
				)
			);

	runAppend( context );
	assert.equal(
		cleanOutput( context ),
		"NN",
		"Initially, there are no duplicates until checkDuplicates() has run asynchronously"
	);

	return Promise.resolve()
		.then( () => allResolvedAndRendered() )
		.then( () => {
			assert.equal(
				cleanOutput( context ),
				"NY",
				"Duplicate check has run asynchronously and second item is now a duplicate"
			);

			run( () => content.pushObjects([ { data: A } ]) );
			assert.equal(
				cleanOutput( context ),
				"NYN",
				"New pending item is not a duplicate until it has been resolved"
			);

			resolveA( 1 );

			return allResolvedAndRendered();
		})
		.then( () => {
			assert.equal(
				cleanOutput( context ),
				"NYY",
				"Item has been resolved and is now a duplicate"
			);

			run( () => content.pushObjects([ { data: B }, { data: C } ]) );
			assert.equal(
				cleanOutput( context ),
				"NYYNN",
				"New pending items are no duplicates until they have been resolved"
			);

			resolveB( 2 );
			resolveC( 1 );

			return allResolvedAndRendered();
		})
		.then( () => {
			assert.equal(
				cleanOutput( context ),
				"NYYNY",
				"Items have been resolved and the last one is a duplicate"
			);
		});

});
