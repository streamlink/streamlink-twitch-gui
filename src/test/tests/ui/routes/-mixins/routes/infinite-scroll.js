// TODO: properly rewrite tests by using sinon
import { module, test } from "qunit";
import { A as EmberNativeArray } from "@ember/array";
import { default as EmberObject, get, getProperties, set, setProperties } from "@ember/object";
import Route from "@ember/routing/route";

import cssInfiniteScrollMixinInjector
	from "inject-loader!ui/routes/-mixins/routes/infinite-scroll/css";
import infiniteScrollMixinInjector
	from "inject-loader?./css!ui/routes/-mixins/routes/infinite-scroll";


let testing;


module( "ui/routes/-mixins/routes/infinite-scroll", {
	beforeEach() {
		// TODO: globally set testing to true
		testing = window.Ember.testing;
		window.Ember.testing = true;
	},
	afterEach() {
		window.Ember.testing = testing;
	}
});


test( "CSS", assert => {

	assert.expect( 18 );

	const body = { clientHeight: 1000 };

	function inject( content, querySelector = () => {} ) {
		const styleNode = document.createElement( "style" );
		styleNode.innerText = content;
		document.head.appendChild( styleNode );

		const module = cssInfiniteScrollMixinInjector({
			"nwjs/Window": {
				window: {
					CSSMediaRule: window.CSSMediaRule,
					CSSStyleRule: window.CSSStyleRule,
					document: {
						styleSheets: [ styleNode.sheet ],
						querySelector,
						body
					}
				}
			}
		});

		document.head.removeChild( styleNode );

		return module;
	}

	( () => {
		const {
			cssMinWidthRules,
			cachedMinHeights
		} = inject( ".foo { color: red; }" );

		assert.propEqual( cssMinWidthRules, [], "Empty min width rules" );
		assert.propEqual( cachedMinHeights, {}, "Empty cached min heights" );
	})();

	( () => {
		const {
			cssMinWidthRules
		} = inject( `
			@media (max-width: 250px) { .foo { width: 100%; } }
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 750px) and (min-width: 500px) { .foo { width: 33.333%; } }
			@media (min-width: 1000px) { .foo { width: 25%; } }
			@media (min-width: 1000px) {} }
		` );

		assert.propEqual(
			cssMinWidthRules.map( elem => elem.cssText.replace( /\s/g, "" ) ),
			[
				"@media(max-width:500px)and(min-width:250px){.foo{width:50%;}}",
				"@media(max-width:750px)and(min-width:500px){.foo{width:33.333%;}}",
				"@media(min-width:1000px){.foo{width:25%;}}"
			],
			"Finds all media rules containing min-width and optional max-width constraints"
		);
	})();

	( () => {
		const {
			cachedMinHeights
		} = inject( ".foo, .bar { min-height: 100px; } .baz { min-height: 200px; }" );

		assert.propEqual(
			cachedMinHeights,
			{
				".foo": 100,
				".bar": 100,
				".baz": 200
			},
			"Finds multiple min-height declarations"
		);
	})();

	( () => {
		const {
			getNeededColumns
		} = inject( `
			@media (max-width: 500px) and (min-width: 250px) { .foo { width: 50%; } }
			@media (max-width: 750px) and (min-width: 500px) { .foo { width: 33.333%; } }
			@media (min-width: 1000px) { .foo { width: 25%; } }
		` );

		assert.strictEqual( getNeededColumns( ".foo", 1920 ), 4, "4 columns at 1920" );
		assert.strictEqual( getNeededColumns( ".foo", 1000 ), 4, "4 columns at 1000" );
		assert.strictEqual( getNeededColumns( ".foo", 999 ), 3, "3 columns at 999" );
		assert.strictEqual( getNeededColumns( ".foo", 500 ), 3, "3 columns at 500" );
		assert.strictEqual( getNeededColumns( ".foo", 499 ), 2, "2 columns at 499" );
		assert.strictEqual( getNeededColumns( ".foo", 250 ), 2, "2 columns at 250" );
		assert.strictEqual( getNeededColumns( ".foo", 249 ), 2, "2 columns at 249" );
		assert.throws( () => getNeededColumns( ".bar", 1000 ), Error, "Invalid selector" );
	})();

	( () => {
		let calls = 0;
		const {
			getNeededRows
		} = inject(
			".foo, .bar { min-height: 100px; } .baz { min-height: 200px; }",
			selector => {
				switch ( ++calls ) {
					case 1:
						assert.strictEqual( selector, "body > .wrapper", "Default container" );
						return { clientHeight: 500 };
					case 2:
						assert.strictEqual( selector, ".qux", "Custom container" );
						return { clientHeight: 750 };
					case 3:
					case 4:
						return null;
				}
				throw new Error();
			}
		);

		assert.strictEqual( getNeededRows( ".foo" ), 6, "6 rows at 500" );
		assert.strictEqual( getNeededRows( ".foo", ".qux" ), 9, "9 rows at 750" );
		assert.strictEqual( getNeededRows( ".foo" ), 11, "11 100px rows at 1000" );
		assert.strictEqual( getNeededRows( ".baz" ), 6, "6 200px rows at 1000" );
	})();

});


test( "Default properties", assert => {

	const { default: InfiniteScrollMixin } = infiniteScrollMixinInjector({
		"./css": {}
	});

	const route = Route.extend( InfiniteScrollMixin ).create();
	assert.strictEqual(
		get( route, "contentPath" ),
		"controller.model",
		"Observes the controller.model property by default"
	);
	assert.strictEqual(
		get( route, "itemSelector" ),
		"",
		"Has an empty itemSelector by default"
	);
	assert.strictEqual(
		get( route, "offset" ),
		0,
		"Has an initial offset value of 0"
	);
	assert.strictEqual(
		get( route, "limit" ),
		0,
		"Has an initial limit value of 0"
	);
	assert.strictEqual(
		get( route, "_filter" ),
		0,
		"Has an initial _filter value of 0"
	);
	assert.strictEqual(
		get( route, "maxAutoFetches" ),
		3,
		"Has a default maxAutoFetches value of 3"
	);
	assert.strictEqual(
		get( route, "maxLimit" ),
		100,
		"Has a default maxLimit value of 100"
	);
	assert.strictEqual(
		get( route, "fetchMetadataPath" ),
		"meta.total",
		"Looks for the meta.total fetch metadata by default"
	);

});


test( "Fetch size", assert => {

	assert.expect( 12 );

	let calls = 0;
	const { default: InfiniteScrollMixin } = infiniteScrollMixinInjector({
		"./css": {
			getNeededColumns( selector ) {
				assert.strictEqual( selector, ".foo", "Calls getNeededColumns" );
				switch ( calls ) {
					case 1: return 3;
					case 2: return 7;
					case 3: return 10;
					case 4: return 10;
				}
				throw new Error();
			},
			getNeededRows( selector ) {
				assert.strictEqual( selector, ".foo", "Calls getNeededRows" );
				switch ( calls ) {
					case 1: return 7;
					case 2: return 3;
					case 3: return 2;
					case 4: return 20;
				}
				throw new Error();
			}
		}
	});

	const route = Route.extend( InfiniteScrollMixin, {
		itemSelector: ".foo"
	}).create();

	// first request
	set( route, "offset", 0 );
	++calls;
	route.calcFetchSize();
	assert.strictEqual( get( route, "limit" ), 21, "Has the correct limit of 21" );

	// follow up request
	set( route, "offset", 21 );
	++calls;
	route.calcFetchSize();
	assert.strictEqual( get( route, "limit" ), 21, "Has the correct limit of 21" );

	// fill the last row when the number of columns changes
	set( route, "offset", 42 );
	++calls;
	route.calcFetchSize();
	assert.strictEqual( get( route, "limit" ), 28, "Has the correct limit of 28" );

	// respect the maxLimit value
	set( route, "offset", 0 );
	++calls;
	route.calcFetchSize();
	assert.strictEqual( get( route, "limit" ), 100, "Has the correct limit of 100" );

});


test( "Offset, limit and filter", async assert => {

	assert.expect( 20 );

	const { default: InfiniteScrollMixin } = infiniteScrollMixinInjector({
		"./css": {}
	});

	const model = new EmberNativeArray([
		{ value: 1 },
		{ value: 2 }
	]);
	const controller = EmberObject.create();

	const route = Route.extend({
		async beforeModel() {
			assert.ok( true, "Calls parent's beforeModel method" );
		},
		setupController( controller, model ) {
			assert.ok( true, "Calls parent's setupController method" );
			set( controller, "model", model );
			set( this, "controller", controller );
		}
	}, InfiniteScrollMixin, {
		calcFetchSize() {
			assert.ok( true, "Calls calcFetchSize()" );
			set( this, "_limit", 10 );
		}
	}).create({
		offset: 10,
		_filter: 5
	});

	await route.beforeModel();
	assert.strictEqual( get( route, "offset" ), 0, "Resets offset property on beforeModel" );
	assert.strictEqual( get( route, "_filter" ), 0, "Resets _filter property on beforeModel" );

	route.setupController( controller, model );
	assert.strictEqual( get( route, "offset" ), 2, "offset is now a computed property" );
	assert.strictEqual( get( route, "limit" ), 10, "Has a limit" );
	assert.strictEqual( get( controller, "hasFetchedAll" ), true, "hasFetchedAll is true" );
	assert.strictEqual( get( controller, "isFetching" ), false, "isFetching is false" );

	set( route, "_filter", 5 );
	assert.strictEqual( get( route, "limit" ), 15, "limit updates on _filter changes" );
	assert.strictEqual( get( route, "offset" ), 7, "offset updates on _filter changes" );
	model.pushObjects([ { value: 1 }, { value: 2 } ]);
	assert.strictEqual( get( route, "offset" ), 9, "offset updates on model changes" );

	// set to zero
	model.clear();
	set( route, "_filter", 0 );

	model.pushObjects( route.filterFetchedContent(
		[ { value: 1 }, { value: 2 }, { value: 3 } ],
		item => item.value % 2 === 1
	) );
	assert.strictEqual(
		get( route, "_filter" ),
		1,
		"One item has been filtered"
	);
	// 10 + 1
	assert.strictEqual(
		get( route, "limit" ),
		11,
		"Will fetch one item more next time"
	);
	assert.strictEqual(
		get( route, "offset" ),
		3,
		"offset is the sum of added and filtered items"
	);

	model.pushObjects( route.filterFetchedContent(
		[ { value: 1 }, { value: 2 }, { value: 3 } ],
		"value",
		3
	) );
	// 1 old + 2 new
	assert.strictEqual(
		get( route, "_filter" ),
		3,
		"Three items have been filtered overall"
	);
	// 10 base + 1 old + 2 new
	assert.strictEqual(
		get( route, "limit" ),
		13,
		"Will fetch three items more next time"
	);
	// 3 old + 3 new
	assert.strictEqual(
		get( route, "offset" ),
		6,
		"offset is the sum of recent, added and filtered items"
	);

	// will only return in testing mode
	const res = route.send( "willTransition" );
	assert.strictEqual( res, true, "willTransition event bubbles up" );
	set( route, "_filter", 10 );
	model.pushObjects([ { value: 1 }, { value: 2 } ]);
	assert.strictEqual( get( route, "offset" ), 0, "Resets offset on willTransition" );

});


test( "WillFetchContent without metadata", async assert => {

	assert.expect( 23 );

	let response;
	let limit = 1;

	const { default: InfiniteScrollMixin } = infiniteScrollMixinInjector({
		"./css": {}
	});

	const model = new EmberNativeArray([
		{ value: 1 },
		{ value: 2 }
	]);
	const controller = EmberObject.create();

	const route = Route.extend({
		setupController( controller, model ) {
			set( controller, "model", model );
			set( this, "controller", controller );
		}
	}, InfiniteScrollMixin, {
		calcFetchSize() {
			assert.ok( true, "Calls calcFetchSize()" );
			set( this, "_limit", limit );
		},
		fetchContent() {
			assert.ok( true, "Calls fetchContent()" );
			return response;
		}
	}).create({
		maxAutoFetches: 1
	});

	await route.beforeModel();
	route.setupController( controller, model );

	setProperties( controller, {
		isFetching: true
	});
	// does nothing when isFetching is true
	await route.send( "willFetchContent" );

	setProperties( controller, {
		isFetching: false,
		hasFetchedAll: true
	});
	// does nothing when hasFetchedAll is true
	await route.send( "willFetchContent" );

	setProperties( controller, {
		isFetching: false,
		hasFetchedAll: false
	});
	// does nothing when maxAutoFetches is reached and not fetching not forced
	await route.send( "willFetchContent" );

	// fetch error
	await ( async () => {
		response = Promise.reject();
		set( controller, "hasFetchedAll", false );
		const promise = route.send( "willFetchContent", true );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: false,
				isFetching: true
			},
			"Controller has the correct properties while fetching"
		);
		await promise;
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: true,
				hasFetchedAll: false,
				isFetching: false
			},
			"Controller has the correct properties on an error"
		);
		assert.strictEqual(
			get( model, "length" ),
			2,
			"No items are added to the model on an error"
		);
	})();

	// no force required anymore
	limit = 3;

	// invalid response
	await ( async () => {
		response = null;
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: true,
				isFetching: false
			},
			"Controller has the correct properties on an invalid response"
		);
		assert.strictEqual(
			get( model, "length" ),
			2,
			"No items are added to the model on an invalid response"
		);
	})();

	// empty response
	await ( async () => {
		response = [];
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: true,
				isFetching: false
			},
			"Controller has the correct properties on an empty response"
		);
		assert.strictEqual(
			get( model, "length" ),
			2,
			"No items are added to the model on an empty response"
		);
	})();

	// response with enough content
	await ( async () => {
		response = new EmberNativeArray([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: false,
				isFetching: false
			},
			"Controller has the correct properties after fetching enough content"
		);
		assert.strictEqual(
			get( model, "length" ),
			5,
			"Three items are added to the model"
		);
	})();

	limit = 10;

	// response with not enough content
	await ( async () => {
		response = new EmberNativeArray([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: true,
				isFetching: false
			},
			"Controller has the correct properties after fetching not enough content"
		);
		assert.strictEqual(
			get( model, "length" ),
			8,
			"Three more items are added to the model"
		);
	})();

});


test( "WillFetchContent with metadata", async assert => {

	assert.expect( 18 );

	let response;
	let limit = 3;

	const { default: InfiniteScrollMixin } = infiniteScrollMixinInjector({
		"./css": {}
	});

	const model = new EmberNativeArray();
	const controller = EmberObject.create();

	const route = Route.extend({
		setupController( controller, model ) {
			set( controller, "model", model );
			set( this, "controller", controller );
		}
	}, InfiniteScrollMixin, {
		calcFetchSize() {
			assert.ok( true, "Calls calcFetchSize()" );
			set( this, "_limit", limit );
		},
		fetchContent() {
			assert.ok( true, "Calls fetchContent()" );
			return response;
		}
	}).create();

	await route.beforeModel();
	route.setupController( controller, model );

	// response with invalid metadata
	await ( async () => {
		model.clear();
		response = new EmberNativeArray([ { value: 1 }, { value: 2 } ]);
		set( response, "meta", { total: "foo" } );
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: true,
				isFetching: false
			},
			"Controller has the correct properties after fetching with invalid metadata"
		);
		assert.strictEqual(
			get( model, "length" ),
			2,
			"Three items are added to the model"
		);
	})();

	// response with partial content
	await ( async () => {
		model.clear();
		response = new EmberNativeArray([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( response, "meta", { total: 5 } );
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: false,
				isFetching: false
			},
			"Controller has the correct properties after fetching partial content"
		);
		assert.strictEqual(
			get( model, "length" ),
			3,
			"Three items are added to the model"
		);
	})();

	// response with all content
	await ( async () => {
		model.clear();
		response = new EmberNativeArray([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( response, "meta", { total: 3 } );
		set( controller, "hasFetchedAll", false );
		await route.send( "willFetchContent" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: true,
				isFetching: false
			},
			"Controller has the correct properties after fetching all content"
		);
		assert.strictEqual(
			get( model, "length" ),
			3,
			"Three items are added to the model"
		);
	})();

	// response with missing content (return 2 items at a limit of 3)
	await ( async () => {
		model.clear();
		response = new EmberNativeArray([ { value: 1 }, { value: 2 } ]);
		set( response, "meta", { total: 5 } );
		setProperties( controller, {
			hasFetchedAll: false,
			_filter: 0
		});
		await route.send( "willFetchContent" );
		assert.strictEqual( get( route, "_filter" ), 1, "Increases _filter by one" );
		assert.propEqual(
			getProperties( controller, "fetchError", "hasFetchedAll", "isFetching" ),
			{
				fetchError: false,
				hasFetchedAll: false,
				isFetching: false
			},
			"Controller has the correct properties after fetching missing content"
		);
		assert.strictEqual(
			get( model, "length" ),
			2,
			"Two items are added to the model"
		);
	})();

});
