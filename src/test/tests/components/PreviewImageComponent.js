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
	run,
	Component,
	EventDispatcher
} from "Ember";
import PreviewImageComponent from "components/PreviewImageComponent";
import src from "transparent-image";


const { scheduleOnce } = run;
const { compile } = HTMLBars;

let eventDispatcher, owner, context;


module( "components/PreviewImageComponent", {
	beforeEach() {
		eventDispatcher = EventDispatcher.create();
		eventDispatcher.setup( {}, fixtureElement );
		owner = buildOwner();
		owner.register( "event_dispatcher:main", eventDispatcher );
		owner.register( "component:preview-image", PreviewImageComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( eventDispatcher );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "Valid image source", assert => {

	const done = assert.async();

	let title = "bar";
	context = Component.extend({
		src,
		title,
		onLoad() {
			assert.ok(
				getElem( context, ".previewImage" ).get( 0 ) instanceof HTMLImageElement,
				"Image loads correctly"
			);
			done();
		},
		onError() {
			assert.ok( false, "Should not fail" );
		},
		layout: compile( "{{preview-image src=src title=title onLoad=onLoad onError=onError}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	assert.ok(
		getElem( context, "img" ).get( 0 ) instanceof HTMLImageElement,
		"Has an image element before loading"
	);
	assert.equal(
		getElem( context, "img" ).eq( 0 ).attr( "src" ),
		src,
		"Has the correct image source"
	);
	assert.equal(
		getElem( context, "img" ).eq( 0 ).attr( "title" ),
		title,
		"Has the correct element title"
	);

});


test( "Invalid image source", assert => {

	const done = assert.async();

	let src = "./foo";
	let title = "bar";
	context = Component.extend({
		src,
		title,
		onLoad() {
			assert.ok( false, "Should not load" );
		},
		onError() {
			assert.ok(
				getElem( context, ".previewError" ).get( 0 ),
				"Is in error state"
			);
			assert.equal(
				getElem( context, ".previewError" ).eq( 0 ).attr( "title" ),
				title,
				"Error element has a title"
			);
			done();
		},
		layout: compile( "{{preview-image src=src title=title onLoad=onLoad onError=onError}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	assert.ok(
		getElem( context, "img" ).get( 0 ) instanceof HTMLImageElement,
		"Has an image element before loading"
	);

});


test( "Missing image source", assert => {

	const done = assert.async();

	context = Component.extend({
		src,
		layout: compile( "{{preview-image}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	assert.strictEqual(
		getElem( context, "img" ).get( 0 ),
		undefined,
		"Does not have an image element"
	);

	scheduleOnce( "afterRender", () => {
		assert.ok(
			getElem( context, ".previewError" ).get( 0 ),
			"Is in error state"
		);
		done();
	});

});
