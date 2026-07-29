/* eslint-disable quotes */
import { module, test } from "qunit";

import Substitution from "utils/parameters/Substitution";


const { substitute } = Substitution;


module( "utils/parameters/Substitution" );


test( "Substitutions", assert => {

	const foo = new Substitution( "foo", "foo" );
	const bar = new Substitution( "bar", "bar" );
	const baz = new Substitution( "baz", "baz" );
	const foobar = new Substitution( [ "foo", "bar" ], "foobar" );


	assert.equal(
		substitute( { foo: "foo" }, foo, "{bar}" ),
		"{bar}",
		"Invalid variable"
	);

	assert.equal(
		substitute( {}, foo, "{foo}" ),
		"{foo}",
		"Unknown property"
	);

	assert.deepEqual(
		[
			substitute( { foo: "foo" }, foo, "{foo}" ),
			substitute( { bar: "bar" }, bar, "{bar}" ),
			substitute( { baz: "baz" }, baz, "{baz}" )
		],
		[
			"foo",
			"bar",
			"baz"
		],
		"Simple variables"
	);

	assert.equal(
		substitute( { foobar: "foobar" }, foobar, "{foo}{bar}" ),
		"foobarfoobar",
		"Multiple variables"
	);

	assert.equal(
		substitute( { foo: "foo" }, foo, "{FOO}" ),
		"foo",
		"Case insensitive variables"
	);

	assert.equal(
		substitute(
			{ foo: "foo", bar: "bar", baz: "baz" },
			[ foo, bar, baz ],
			"{foo}{bar}{baz}"
		),
		"foobarbaz",
		"Substitution list"
	);

	assert.equal(
		substitute( { foo: "bar" }, foo, "{{foo}}" ),
		"{{foo}}",
		"Ignore escaped variables"
	);

	assert.equal(
		substitute(
			{ foo: "{bar}", bar: "{baz}", baz: "{foo}" },
			[ foo, bar, baz ],
			"{foo}{bar}{baz}"
		),
		"{bar}{baz}{foo}",
		"Don't parse substituted variables again"
	);

	assert.equal(
		substitute( { foo: '";rm -rf / --no-preserve-root'  }, foo, '"{foo}"', true ),
		'"\\";rm -rf / --no-preserve-root"',
		"Escape double-quotes inside a double-quotes string"
	);

	assert.equal(
		substitute( { foo: "';rm -rf / --no-preserve-root"  }, foo, "'{foo}'", true ),
		"'\\';rm -rf / --no-preserve-root'",
		"Escape single-quotes inside a single-quotes string"
	);

	assert.equal(
		substitute( { foo: ";rm -rf / --no-preserve-root"  }, foo, '{foo}', true ),
		'\\;\\r\\m\\ \\-\\r\\f\\ \\/\\ \\-\\-\\n\\o\\-\\p\\r\\e\\s\\e\\r\\v\\e\\-\\r\\o\\o\\t',
		"Escape every character everywhere else"
	);

	assert.equal(
		substitute( { foo: "\\" }, foo, '"{foo}"', true ),
		'"\\\\"',
		"Don't break strings with tailing escape characters"
	);

});
