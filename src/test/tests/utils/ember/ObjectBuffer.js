import { module, test } from "qunit";
import { default as EmberObject, get, set, getProperties } from "@ember/object";
import { addObserver } from "@ember/object/observers";
import sinon from "sinon";

import ObjectBuffer from "utils/ember/ObjectBuffer";


module( "utils/ember/ObjectBuffer", function() {
	test( "Flat ObjectBuffer", function( assert ) {
		const content = {
			foo: "foo",
			bar: "bar"
		};
		const buffer = ObjectBuffer.create({ content });

		// initial
		assert.propEqual(
			[
				get( buffer, "foo" ),
				get( buffer, "bar" )
			],
			[
				"foo",
				"bar"
			],
			"initial: return initial values"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: "bar"
			},
			"initial: getContent() returns initial values"
		);
		assert.notOk( buffer.isDirty, "initial: buffer is not dirty" );

		// set
		assert.strictEqual(
			set( buffer, "foo", "foo" ),
			"foo",
			"Setting the same value returns the same value"
		);
		assert.strictEqual(
			set( buffer, "foo", "bar" ),
			"bar",
			"Setting a new value returns the new value"
		);
		set( buffer, "bar", "foo" );
		assert.strictEqual(
			get( buffer, "foo" ),
			"bar",
			"modified: return modified values"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: "bar"
			},
			"modified: getContent() returns initial values"
		);
		assert.ok(
			buffer.isDirty,
			"modified: buffer is dirty"
		);

		// reset
		set( buffer, "foo", "foo" );
		assert.ok( buffer.isDirty, "reset: buffer is still dirty" );
		set( buffer, "bar", "bar" );
		assert.notOk( buffer.isDirty, "reset: buffer is not dirty" );

		// discard
		set( buffer, "foo", "bar" );
		buffer.discardChanges();
		assert.strictEqual(
			get( buffer, "foo" ),
			"foo",
			"discarded: return initial values"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: "bar"
			},
			"discarded: getContent() returns initial values"
		);
		assert.notOk( buffer.isDirty, "discarded: buffer is not dirty" );

		// apply
		set( buffer, "foo", "bar" );
		buffer.applyChanges();
		assert.strictEqual(
			get( buffer, "foo" ),
			"bar",
			"applied: return applied values"
		);
		assert.deepEqual(
			buffer.getContent(),
			{
				foo: "bar",
				bar: "bar"
			},
			"applied: getContent() returns applied values"
		);
		assert.notOk( buffer.isDirty, "applied: buffer is not dirty" );
	});

	test( "Observable isDirty", function ( assert ) {
		const content = { foo: "foo" };
		const buffer = ObjectBuffer.create({ content });

		const spyIsDirty = sinon.spy();
		addObserver( buffer, "isDirty", spyIsDirty );

		set( buffer, "foo", "foo" );
		assert.ok( spyIsDirty.notCalled, "Doesn't trigger if no change to isDirty was made" );
		assert.notOk( buffer.isDirty, "Not dirty yet" );

		set( buffer, "foo", "baz" );
		assert.ok( spyIsDirty.calledOnce, "Triggers if change to isDirty was made" );
		assert.ok( buffer.isDirty, "Dirty now" );
		spyIsDirty.resetHistory();

		set( buffer, "foo", "foo" );
		assert.ok( spyIsDirty.calledOnce, "Triggers if change to isDirty was made" );
		assert.notOk( buffer.isDirty, "Not dirty anymore" );
	});

	test( "ObjectBuffer of ObjectBuffer", function( assert ) {
		const a = ObjectBuffer.create({ content: { foo: "foo" } });
		const b = ObjectBuffer.create({ content: { a } });

		assert.strictEqual( get( b, "a" ), undefined, "Ignores nested ObjectBuffers" );

		set( a, "foo", "bar" );
		assert.notOk( b.isDirty, "Doesn't set isDirty on \"parent\" ObjectBuffer" );
	});

	test( "Nested ObjectBuffer", function( assert ) {
		const content = {
			foo: "foo",
			bar: {
				baz: "baz",
				qux: {
					quux: "quux"
				}
			}
		};
		const buffer = ObjectBuffer.create({ content });

		// initial
		assert.propEqual(
			[
				get( buffer, "foo" ),
				get( buffer, "bar.baz" ),
				get( buffer, "bar.qux.quux" )
			],
			[
				"foo",
				"baz",
				"quux"
			],
			"initial: return initial values"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: {
					baz: "baz",
					qux: {
						quux: "quux"
					}
				}
			},
			"initial: getContent() returns initial values"
		);
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				false,
				false,
				false
			],
			"initial: all buffers are not dirty"
		);

		// modify root
		set( buffer, "foo", "bar" );
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				true,
				false,
				false
			],
			"modified root: only the root buffer is dirty"
		);

		// modify descendant
		set( buffer, "bar.qux.quux", "foo" );
		assert.strictEqual(
			get( buffer, "bar.qux.quux" ),
			"foo",
			"modified descendant: return modified value"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: {
					baz: "baz",
					qux: {
						quux: "quux"
					}
				}
			},
			"modified root and descendant: getContent() returns initial values"
		);
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				true,
				true,
				true
			],
			"modified root and descendant: all buffers are dirty"
		);

		// reset root
		set( buffer, "foo", "foo" );
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				true,
				true,
				true
			],
			"modified descendant: all buffers are still dirty"
		);

		// discard root
		buffer.discardChanges();
		assert.strictEqual(
			get( buffer, "bar.qux.quux" ),
			"quux",
			"discarded root: return initial descendant value"
		);
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				false,
				false,
				false
			],
			"discarding a root buffer also discards all descendants"
		);

		// apply
		set( buffer, "bar.qux.quux", "foo" );
		buffer.applyChanges();
		assert.strictEqual(
			get( buffer, "bar.qux.quux" ),
			"foo",
			"applied root: return applied descendant value"
		);
		assert.propEqual(
			buffer.getContent(),
			{
				foo: "foo",
				bar: {
					baz: "baz",
					qux: {
						quux: "foo"
					}
				}
			},
			"applied root: getContent() returns applied values"
		);
		assert.propEqual(
			[
				get( buffer, "isDirty" ),
				get( buffer, "bar.isDirty" ),
				get( buffer, "bar.qux.isDirty" )
			],
			[
				false,
				false,
				false
			],
			"applying a root buffer also applies all descendants"
		);
	});

	test( "ObjectBuffer with same nested objects", function( assert ) {
		const contentInnerInner = {
			baz: "qux"
		};
		const contentInner = {
			bar: contentInnerInner
		};
		const contentOuter = {
			foo: contentInner
		};
		const buffer = ObjectBuffer.create({
			content: contentOuter
		});

		set( buffer, "foo.bar.baz", "foo" );
		buffer.applyChanges();

		assert.strictEqual(
			contentOuter.foo.bar,
			contentInnerInner,
			"Nested object references are not changed"
		);
		assert.strictEqual(
			buffer.getContent(),
			contentOuter,
			"getOutput() returns the original object"
		);
		assert.strictEqual(
			buffer.getContent()[ "foo" ][ "bar" ][ "baz" ],
			"foo",
			"Nested objects of the original object have been updated"
		);
	});

	test( "Observed properties and reference object", function( assert ) {
		const reference = EmberObject.create({
			foo: false,
			bar: {
				baz: false,
				qux: {
					quux: false
				}
			}
		});

		// shallow copy
		const content = Object.keys( reference ).reduce( ( obj, key ) => {
			obj[ key ] = reference[ key ];
			return obj;
		}, {} );

		const buffer = ObjectBuffer.create({ content });

		const spyBufferFoo = sinon.spy();
		const spyBufferBarBaz = sinon.spy();
		const spyBufferBarQuxQuux = sinon.spy();
		addObserver( buffer, "foo", spyBufferFoo );
		addObserver( buffer, "bar.baz", spyBufferBarBaz );
		addObserver( buffer, "bar.qux.quux", spyBufferBarQuxQuux );

		const spyContentFoo = sinon.spy();
		const spyContentBarBaz = sinon.spy();
		const spyContentBarQuxQuux = sinon.spy();
		addObserver( content, "foo", spyContentFoo );
		addObserver( content, "bar.baz", spyContentBarBaz );
		addObserver( content, "bar.qux.quux", spyContentBarQuxQuux );

		const spyRefBar = sinon.spy();
		const spyRefBarQux = sinon.spy();
		addObserver( reference, "bar", spyRefBar );
		addObserver( reference, "bar.qux", spyRefBarQux );

		set( buffer, "foo", true );
		set( buffer, "bar.baz", true );
		set( buffer, "bar.qux.quux", true );

		// triggers observers on the buffer and content
		buffer.applyChanges( reference );

		assert.strictEqual( spyBufferFoo.callCount, 2, "buffer's foo changed" );
		assert.strictEqual( spyBufferBarBaz.callCount, 2, "buffer's bar.baz changed" );
		assert.strictEqual( spyBufferBarQuxQuux.callCount, 2, "buffer's bar.qux.quux changed" );

		assert.strictEqual( spyContentFoo.callCount, 1, "content's foo changed" );
		assert.strictEqual( spyContentBarBaz.callCount, 1, "content's bar.baz changed" );
		assert.strictEqual( spyContentBarQuxQuux.callCount, 1, "content's bar.qux.quux changed" );

		assert.strictEqual( spyRefBar.callCount, 1, "reference's baz modified" );
		assert.strictEqual( spyRefBarQux.callCount, 1, "reference's baz.qux modified" );

		assert.propEqual(
			getProperties( reference, "foo", "bar" ),
			{
				foo: true,
				bar: {
					baz: true,
					qux: {
						quux: true
					}
				}
			},
			"ObjectBuffer.applyChanges sets properties on the target object"
		);
	});
});
