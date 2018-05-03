import { module, test } from "qunit";
import ArrayProxy from "@ember/array/proxy";
import sinon from "sinon";

import preloadInjector from "inject-loader?nwjs/Window!utils/preload";


module( "utils/preload", {
	beforeEach() {
		class Image {
			addEventListener() {}
			_setSrc() {}
			set src( value ) {
				this._setSrc( value );
			}
		}

		this.imageAddEventListenerSpy = sinon.spy( Image.prototype, "addEventListener" );
		this.imageSrcSpy = sinon.spy( Image.prototype, "_setSrc" );

		const {
			default: preload,
			preloadImage
		} = preloadInjector({
			"nwjs/Window": {
				window: { Image }
			}
		});

		this.preload = preload;
		this.preloadImage = preloadImage;
	}
});


test( "preloadImage", async function( assert ) {

	await this.preloadImage();
	await this.preloadImage( null );
	await this.preloadImage( {} );
	await this.preloadImage( "" );
	assert.notOk(
		this.imageAddEventListenerSpy.called || this.imageSrcSpy.called,
		"Doesn't do anything when the url is missing"
	);

	const promiseFoo = this.preloadImage( "foo" );
	assert.ok( promiseFoo instanceof Promise, "Returns a promise" );
	assert.propEqual(
		this.imageAddEventListenerSpy.args,
		[ [ "load", new Function() ], [ "error", new Function() ] ],
		"Registers load and error event listeners"
	);
	assert.strictEqual( this.imageSrcSpy.args[0][0], "foo", "Sets image source" );
	assert.ok(
		this.imageSrcSpy.calledAfter( this.imageAddEventListenerSpy ),
		"Registers event listeners before setting the image source"
	);
	// load
	this.imageAddEventListenerSpy.firstCall.args[1]();
	await promiseFoo;
	assert.ok( true, "Resolves on load" );

	this.imageAddEventListenerSpy.resetHistory();
	this.imageSrcSpy.resetHistory();

	const promiseBar = this.preloadImage( "bar" );
	// error
	this.imageAddEventListenerSpy.lastCall.args[1]();
	await promiseBar;
	assert.ok( true, "Resolves on error" );

});


test( "preload - path on an object", async function( assert ) {

	const data = { foo: "foo" };
	const promise = this.preload( data, "foo" );
	assert.ok( promise instanceof Promise, "Returns a promise" );
	assert.propEqual(
		this.imageSrcSpy.args.map( ([ src ]) => src ),
		[ "foo" ],
		"Loads the correct images"
	);
	this.imageAddEventListenerSpy.args.forEach( ([ , cb ], idx ) => idx % 2 === 0 && cb() );
	assert.strictEqual( await promise, data, "Returns input data" );

});


test( "preload - paths on an object", async function( assert ) {

	const data = {
		foo: "foo",
		bar: {
			baz: "baz"
		}
	};
	const promise = this.preload( data, [ "foo", "bar.baz" ] );
	assert.propEqual(
		this.imageSrcSpy.args.map( ([ src ]) => src ),
		[ "foo", "baz" ],
		"Loads the correct images"
	);
	this.imageAddEventListenerSpy.args.forEach( ([ , cb ], idx ) => idx % 2 === 0 && cb() );
	assert.strictEqual( await promise, data, "Returns input data" );

});


test( "preload - paths on an array", async function( assert ) {

	const data = [
		{
			foo: "foo",
			bar: {
				baz: "baz"
			}
		},
		{
			foo: "Foo",
			bar: null
		},
		{
			foo: {},
			bar: {
				baz: "Baz"
			}
		}
	];
	const promise = this.preload( data, [ "foo", "bar.baz" ] );
	assert.propEqual(
		this.imageSrcSpy.args.map( ([ src ]) => src ),
		[ "foo", "baz", "Foo", "Baz" ],
		"Loads the correct images"
	);
	this.imageAddEventListenerSpy.args.forEach( ([ , cb ], idx ) => idx % 2 === 0 && cb() );
	assert.strictEqual( await promise, data, "Returns input data" );

});


test( "preload - paths on an Ember.Enumerable object", async function( assert ) {

	const data = ArrayProxy.create({
		content: [
			{
				foo: "foo",
				bar: {
					baz: "baz"
				}
			},
			{
				foo: "Foo",
				bar: null
			},
			{
				foo: {},
				bar: {
					baz: "Baz"
				}
			}
		]
	});
	const promise = this.preload( data, [ "foo", "bar.baz" ] );
	assert.propEqual(
		this.imageSrcSpy.args.map( ([ src ]) => src ),
		[ "foo", "baz", "Foo", "Baz" ],
		"Loads the correct images"
	);
	this.imageAddEventListenerSpy.args.forEach( ([ , cb ], idx ) => idx % 2 === 0 && cb() );
	assert.strictEqual( await promise, data, "Returns input data" );

});
