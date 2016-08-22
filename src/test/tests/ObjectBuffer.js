import QUnit from "QUnit";
import Ember from "Ember";
import ObjectBuffer from "utils/ember/ObjectBuffer";


	var get = Ember.get;
	var set = Ember.set;


	QUnit.module( "ObjectBuffer", {} );


	QUnit.test( "Flat ObjectBuffer", function( assert ) {

		var content = {
			"foo": "foo",
			"bar": "bar"
		};
		var buffer = ObjectBuffer.create({
			content: content
		});


		// initial

		assert.deepEqual(
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

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": "bar"
			},
			"initial: getContent() returns initial values"
		);

		assert.equal(
			get( buffer, "isDirty" ),
			false,
			"initial: buffer is not dirty"
		);


		// set

		set( buffer, "foo", "bar" );

		assert.equal(
			get( buffer, "foo" ),
			"bar",
			"modified: return modified values"
		);

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": "bar"
			},
			"modified: getContent() returns initial values"
		);

		assert.equal(
			get( buffer, "isDirty" ),
			true,
			"modified: buffer is dirty"
		);


		// reset

		set( buffer, "foo", "foo" );

		assert.equal(
			get( buffer, "isDirty" ),
			false,
			"reset: buffer is not dirty"
		);


		// discard

		set( buffer, "foo", "bar" );
		buffer.discardChanges();

		assert.equal(
			get( buffer, "foo" ),
			"foo",
			"discarded: return initial values"
		);

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": "bar"
			},
			"discarded: getContent() returns initial values"
		);

		assert.equal(
			get( buffer, "isDirty" ),
			false,
			"discarded: buffer is not dirty"
		);


		// apply

		set( buffer, "foo", "bar" );
		buffer.applyChanges();

		assert.equal(
			get( buffer, "foo" ),
			"bar",
			"applied: return applied values"
		);

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "bar",
				"bar": "bar"
			},
			"applied: getContent() returns applied values"
		);

		assert.equal(
			get( buffer, "isDirty" ),
			false,
			"applied: buffer is not dirty"
		);

	});


	QUnit.test( "Nested ObjectBuffer", function( assert ) {

		var content = {
			"foo": "foo",
			"bar": {
				"baz": "baz",
				"qux": {
					"quux": "quux"
				}
			}
		};
		var buffer = ObjectBuffer.create({
			content: content
		});


		// initial

		assert.deepEqual(
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

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": {
					"baz": "baz",
					"qux": {
						"quux": "quux"
					}
				}
			},
			"initial: getContent() returns initial values"
		);

		assert.deepEqual(
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

		assert.deepEqual(
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

		assert.equal(
			get( buffer, "bar.qux.quux" ),
			"foo",
			"modified descendant: return modified value"
		);

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": {
					"baz": "baz",
					"qux": {
						"quux": "quux"
					}
				}
			},
			"modified root and descendant: getContent() returns initial values"
		);

		assert.deepEqual(
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

		assert.deepEqual(
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

		assert.equal(
			get( buffer, "bar.qux.quux" ),
			"quux",
			"discarded root: return initial descendant value"
		);

		assert.deepEqual(
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

		assert.equal(
			get( buffer, "bar.qux.quux" ),
			"foo",
			"applied root: return applied descendant value"
		);

		assert.deepEqual(
			buffer.getContent(),
			{
				"foo": "foo",
				"bar": {
					"baz": "baz",
					"qux": {
						"quux": "foo"
					}
				}
			},
			"applied root: getContent() returns applied values"
		);

		assert.deepEqual(
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
