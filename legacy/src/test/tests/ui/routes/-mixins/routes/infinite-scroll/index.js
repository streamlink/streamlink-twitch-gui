import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import { A } from "@ember/array";
import { default as EmberObject, getProperties, set, setProperties } from "@ember/object";
import Route from "@ember/routing/route";

import infiniteScrollMixinInjector
	from "inject-loader?./css!ui/routes/-mixins/routes/infinite-scroll";


module( "ui/routes/-mixins/routes/infinite-scroll/index", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver()
	});

	/** @typedef {TestContext} TestContextInfiniteScrollMixin */
	/** @this TestContextInfiniteScrollMixin */
	hooks.beforeEach(function() {
		this.getNeededColumnsStub = sinon.stub();
		this.getNeededRowsStub = sinon.stub();

		this.subject = infiniteScrollMixinInjector({
			"./css": {
				getNeededColumns: this.getNeededColumnsStub,
				getNeededRows: this.getNeededRowsStub
			}
		})[ "default" ];

		this.beforeModelStub = sinon.stub().resolves();
		this.setupControllerStub = sinon.stub().callsFake(function( controller, model ) {
			set( this, "controller", controller );
			set( controller, "model", model );
		});
		this.baseRoute = Route.extend({
			beforeModel: this.beforeModelStub,
			setupController: this.setupControllerStub
		}).extend( this.subject );
	});


	/** @this TestContextInfiniteScrollMixin */
	test( "Default properties", function( assert ) {
		const modelSpy = sinon.spy();
		const route = this.baseRoute.extend({
			model: modelSpy
		}).create();

		assert.strictEqual(
			route.contentPath,
			"controller.model",
			"Observes the controller.model property by default"
		);
		assert.strictEqual(
			route.itemSelector,
			"",
			"Has an empty itemSelector by default"
		);
		assert.strictEqual(
			route.offset,
			0,
			"Has an initial offset value of 0"
		);
		assert.strictEqual(
			route.limit,
			0,
			"Has an initial limit value of 0"
		);
		assert.strictEqual(
			route.maxAutoFetches,
			3,
			"Has a default maxAutoFetches value of 3"
		);
		assert.strictEqual(
			route.maxLimit,
			100,
			"Has a default maxLimit value of 100"
		);
		assert.strictEqual(
			route.fetchMetadataPath,
			"meta.total",
			"Looks for the meta.total fetch metadata by default"
		);

		assert.notOk( modelSpy.called, "Hasn't called model hook yet" );
		route.fetchContent();
		assert.strictEqual( modelSpy.callCount, 1, "Calls model hook by default on fetchContent" );
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "Fetch size", function( assert ) {
		const route = this.baseRoute.extend({
			itemSelector: ".foo"
		}).create();

		// first request
		set( route, "offset", 0 );
		this.getNeededColumnsStub.returns( 3 );
		this.getNeededRowsStub.returns( 7 );
		route.setFetchSize();
		assert.strictEqual( route.limit, 21, "Has the correct limit of 21" );
		assert.ok(
			this.getNeededColumnsStub.calledOnceWithExactly( ".foo" ),
			"Calls getNeededColumns with correct itemSelector"
		);
		assert.ok(
			this.getNeededRowsStub.calledOnceWithExactly( ".foo" ),
			"Calls getNeededRows with correct itemSelector"
		);
		sinon.reset();

		// follow-up request
		set( route, "offset", 21 );
		this.getNeededColumnsStub.returns( 7 );
		this.getNeededRowsStub.returns( 3 );
		route.setFetchSize();
		assert.strictEqual( route.limit, 21, "Has the correct limit of 21" );
		sinon.reset();

		// fill the last row when the number of columns changes
		set( route, "offset", 42 );
		this.getNeededColumnsStub.returns( 10 );
		this.getNeededRowsStub.returns( 2 );
		route.setFetchSize();
		assert.strictEqual( route.limit, 28, "Has the correct limit of 28" );
		sinon.reset();

		// respect the maxLimit value
		set( route, "offset", 0 );
		this.getNeededColumnsStub.returns( 10 );
		this.getNeededRowsStub.returns( 20 );
		route.setFetchSize();
		assert.strictEqual( route.limit, 100, "limit doesn't exceed the maxLimit" );
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "Offset and limit", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 10 );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub
		}).create({
			offset: 10
		});

		await route.beforeModel();
		assert.ok( this.beforeModelStub.calledOnce, "Calls parent's beforeModel method" );
		assert.strictEqual( route.offset, 0, "Resets offset property on beforeModel" );

		route.setupController( controller, model );
		assert.ok(
			this.setupControllerStub.calledOnceWithExactly( controller, model ),
			"Calls parent's setupController method"
		);
		assert.strictEqual( route.offset, 2, "offset is now a computed property" );
		assert.strictEqual( route.limit, 10, "Has a limit" );
		assert.strictEqual( controller.hasFetchedAll, true, "hasFetchedAll is true" );
		assert.strictEqual( controller.isFetching, false, "isFetching is false" );

		model.pushObjects([ { value: 3 }, { value: 4 } ]);
		assert.strictEqual( route.offset, 4, "offset updates on model changes" );

		const res = route.send( "willTransition" );
		assert.strictEqual( res, true, "willTransition event bubbles up" );
		assert.strictEqual( route.offset, 0, "Resets offset on willTransition" );
		model.pushObjects([ { value: 1 }, { value: 2 } ]);
		assert.strictEqual( route.offset, 0, "Resets offset on willTransition" );
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "WillFetchContent - noop", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 1 );
		const fetchContentStub = sinon.stub();

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create({
			maxAutoFetches: 1
		});

		await route.beforeModel();
		route.setupController( controller, model );
		sinon.resetHistory();

		setProperties( controller, {
			isFetching: true
		});
		await route.send( "willFetchContent" );
		assert.notOk( calcFetchSizeStub.called, "Does nothing when isFetching is true" );

		setProperties( controller, {
			isFetching: false,
			hasFetchedAll: true
		});
		await route.send( "willFetchContent" );
		assert.notOk( calcFetchSizeStub.called, "Does nothing when hasFetchedAll is true" );

		setProperties( controller, {
			isFetching: false,
			hasFetchedAll: false
		});
		await route.send( "willFetchContent" );
		assert.notOk(
			fetchContentStub.called,
			"Does nothing when maxAutoFetches is reached and not fetching not forced"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - error", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 1 );
		const fetchContentStub = sinon.stub().rejects();

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create({
			maxAutoFetches: 1
		});

		await route.beforeModel();
		route.setupController( controller, model );

		set( controller, "hasFetchedAll", false );
		// force = true
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
			"Controller has the correct properties on error"
		);
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2 ],
			"No items are added to the model on error"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - invalid response", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves( null );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2 ],
			"No items are added to the model on an invalid response"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - empty response", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves( [] );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2 ],
			"No items are added to the model on an empty response"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - response with enough content", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves(
			A([ { value: 3 }, { value: 4 }, { value: 5 } ])
		);

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2, 3, 4, 5 ],
			"Three items are added to the model"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - response with not enough content", async function( assert ) {
		const model = A([
			{ value: 1 },
			{ value: 2 }
		]);
		const controller = EmberObject.create();

		const calcFetchSizeStub = sinon.stub().returns( 10 );
		const fetchContentStub = sinon.stub().resolves(
			A([ { value: 3 }, { value: 4 }, { value: 5 } ])
		);

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2, 3, 4, 5 ],
			"Three items are added to the model"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - metadata - invalid", async function( assert ) {
		const model = A();
		const controller = EmberObject.create();

		const response = A([ { value: 1 }, { value: 2 } ]);
		set( response, "meta", { total: "foo" } );

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves( response );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2 ],
			"Two items are added to the model"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - metadata - partial response", async function( assert ) {
		const model = A();
		const controller = EmberObject.create();

		const response = A([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( response, "meta", { total: 5 } );

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves( response );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2, 3 ],
			"Three items are added to the model"
		);
	});

	/** @this TestContextInfiniteScrollMixin */
	test( "willFetchContent - metadata - full response", async function( assert ) {
		const model = A();
		const controller = EmberObject.create();

		const response = A([ { value: 1 }, { value: 2 }, { value: 3 } ]);
		set( response, "meta", { total: 3 } );

		const calcFetchSizeStub = sinon.stub().returns( 3 );
		const fetchContentStub = sinon.stub().resolves( response );

		const route = this.baseRoute.extend({
			calcFetchSize: calcFetchSizeStub,
			fetchContent: fetchContentStub
		}).create();

		await route.beforeModel();
		route.setupController( controller, model );

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
		assert.propEqual(
			model.mapBy( "value" ),
			[ 1, 2, 3 ],
			"Three items are added to the model"
		);
	});
});
