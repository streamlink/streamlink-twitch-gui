import { module, test } from "qunit";

import Parameter from "utils/parameters/Parameter";
import Substitution from "utils/parameters/Substitution";


const { getParameters } = Parameter;


module( "utils/parameters/Parameters" );


test( "Parameters", function( assert ) {

	const obj = {
		a: "a",
		b: "b",
		c: "c",
		d: "foo bar",
		e: "\"foo\" \"bar\"",
		valid: true,
		invalid: false
	};

	function condition( obj ) {
		return obj.valid && !obj.invalid;
	}

	const a = new Parameter( "--a", null, null );

	const b = new Parameter( "--b", null, "b" );
	const c = new Parameter( "--c", null, "unkown" );

	const d = new Parameter( "--d", null, "d" );
	const e = new Parameter( "--e", null, "e" );

	const f = new Parameter( "--f", "valid", "a" );
	const g = new Parameter( "--g", "invalid", null );
	const h = new Parameter( "--h", condition, "a" );
	const i = new Parameter( "--i", [ "valid", "valid" ], "a" );


	assert.deepEqual(
		getParameters( obj, [] ),
		[],
		"No parameters"
	);

	assert.deepEqual(
		getParameters( obj, [ a ] ),
		[ "--a" ],
		"Simple single parameter"
	);

	assert.deepEqual(
		getParameters( obj, [ a, a, a ] ),
		[ "--a", "--a", "--a" ],
		"Simple multiple parameter"
	);

	assert.deepEqual(
		getParameters( obj, [ b ] ),
		[ "--b", "b" ],
		"Single parameter with value"
	);

	assert.deepEqual(
		getParameters( obj, [ c ] ),
		[],
		"Parameter with invalid value"
	);

	assert.deepEqual(
		getParameters( obj, [ b, a, b ] ),
		[ "--b", "b", "--a", "--b", "b" ],
		"Multiple parameters with value"
	);

	assert.deepEqual(
		getParameters( obj, [ d, e ] ),
		[ "--d", "foo bar", "--e", "\"foo\" \"bar\"" ],
		"Multiple parameters with complex values"
	);

	assert.deepEqual(
		getParameters( obj, [ f ] ),
		[ "--f", "a" ],
		"Valid conditional parameter"
	);

	assert.deepEqual(
		getParameters( obj, [ g ] ),
		[],
		"Invalid conditional parameter"
	);

	assert.deepEqual(
		getParameters( obj, [ h ] ),
		[ "--h", "a" ],
		"Dynamic conditional parameter"
	);

	assert.deepEqual(
		getParameters( obj, [ i ] ),
		[ "--i", "a" ],
		"Multiple conditions"
	);

});


test( "Substituted parameters", function( assert ) {

	const obj = {
		foo: "f o o",
		bar: "b a r",
		baz: "b a z",
		param: "{foo} \"{bar}\" \'{baz}\'",

		title: "foo\'s \"bar\" \\",
		paramTitleA: "--title \"{title}\"",
		paramTitleB: "--title \'{title}\'",
		paramTitleC: "--title {title}",

		curlies: "} {foo} {{bar}} {{{baz}}} {{qux} {quux}} }{",
		paramCurlies: "\"{curlies}\""
	};

	const foo = new Substitution( "foo", "foo" );
	const bar = new Substitution( "bar", "bar" );
	const baz = new Substitution( "baz", "baz" );
	const title = new Substitution( "title", "title" );
	const curlies = new Substitution( "curlies", "curlies" );

	const param = new Parameter( "--param", null, "param", [ foo, bar, baz ] );

	const paramTitleA = new Parameter( "--player-args", null, "paramTitleA", [ title ] );
	const paramTitleB = new Parameter( "--player-args", null, "paramTitleB", [ title ] );
	const paramTitleC = new Parameter( "--player-args", null, "paramTitleC", [ title ] );
	const paramTitleD = new Parameter( "-a", null, "paramCurlies", [ curlies ] );

	assert.deepEqual(
		getParameters( obj, [ param ] ),
		[ "--param", "\\f\\ \\o\\ \\o \"b a r\" \'b a z\'" ],
		"Parameter value substitution"
	);

	assert.deepEqual(
		getParameters( obj, [ paramTitleA ] ),
		[ "--player-args", "--title \"foo's \\\"bar\\\" \\\\\"" ],
		"Only escape double quote chars in double quote strings"
	);

	assert.deepEqual(
		getParameters( obj, [ paramTitleB ] ),
		[ "--player-args", "--title \'foo\\\'s \"bar\" \\\\\'" ],
		"Only escape single quote chars in single quote strings"
	);

	assert.deepEqual(
		getParameters( obj, [ paramTitleC ] ),
		[ "--player-args", "--title \\f\\o\\o\\\'\\s\\ \\\"\\b\\a\\r\\\"\\ \\\\" ],
		"Escape all chars"
	);

	assert.deepEqual(
		getParameters( obj, [ paramTitleD ] ),
		[ "-a", "\"}} {{foo}} {{{{bar}}}} {{{{{{baz}}}}}} {{{{qux}} {{quux}}}} }}{{\"" ],
		"Escape curly braces"
	);

});
