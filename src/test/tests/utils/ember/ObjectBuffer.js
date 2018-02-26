import { module, test } from "qunit";
import { default as EmberObject, get, set, getProperties } from "@ember/object";
import { addObserver } from "@ember/object/observers";

import ObjectBuffer from "utils/ember/ObjectBuffer";


module( "utils/ember/ObjectBuffer" );


test( "Flat ObjectBuffer", function( assert ) {

	const content = {
		"foo": "foo",
		"bar": "bar"
	};
	const buffer = ObjectBuffer.create({
		content
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


test( "Nested ObjectBuffer", function( assert ) {

	const content = {
		"foo": "foo",
		"bar": {
			"baz": "baz",
			"qux": {
				"quux": "quux"
			}
		}
	};
	const buffer = ObjectBuffer.create({
		content
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


test( "ObjectBuffer with same nested objects", function( assert ) {

	const contentInnerInner = {
		"baz": "qux"
	};
	const contentInner = {
		"bar": contentInnerInner
	};
	const contentOuter = {
		"foo": contentInner
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

	assert.expect( 3 + 2*3 + 2 + 1 );

	const reference = EmberObject.create({
		"foo": false,
		"bar": {
			"baz": false,
			"qux": {
				"quux": false
			}
		}
	});

	// shallow copy
	const content = Object.keys( reference ).reduce( ( obj, key ) => {
		obj[ key ] = reference[ key ];
		return obj;
	}, {} );

	const buffer = ObjectBuffer.create({ content });

	addObserver( buffer, "foo", () => {
		assert.ok( true, "The buffer's foo property has been changed" );
	});
	addObserver( buffer, "bar.baz", () => {
		assert.ok( true, "The buffer's bar.baz property has been changed" );
	});
	addObserver( buffer, "bar.qux.quux", () => {
		assert.ok( true, "The buffer's bar.qux.quux property has been changed" );
	});

	addObserver( content, "foo", () => {
		assert.ok( true, "The content's foo property has been changed" );
	});
	addObserver( content, "bar.baz", () => {
		assert.ok( true, "The content's bar.baz property has been changed" );
	});
	addObserver( content, "bar.qux.quux", () => {
		assert.ok( true, "The content's bar.qux.quux property has been changed" );
	});

	addObserver( reference, "bar", () => {
		assert.ok( true, "The reference's baz object was modified" );
	});
	addObserver( reference, "bar.qux", () => {
		assert.ok( true, "The reference's baz.qux object was modified" );
	});

	set( buffer, "foo", true );
	set( buffer, "bar.baz", true );
	set( buffer, "bar.qux.quux", true );

	// triggers observers on the buffer and content
	buffer.applyChanges( reference );

	assert.deepEqual(
		getProperties( reference, "foo", "bar" ),
		{
			"foo": true,
			"bar": {
				"baz": true,
				"qux": {
					"quux": true
				}
			}
		},
		"ObjectBuffer.applyChanges sets properties on the target object"
	);

});
