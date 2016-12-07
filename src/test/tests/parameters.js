/* jshint quotmark:false */
import {
	module,
	test
} from "QUnit";
import Parameter from "utils/Parameter";
import ParameterCustom from "utils/ParameterCustom";
import Substitution from "utils/Substitution";


const { substitute: subst } = Substitution;
const { getParameters: getParams } = Parameter;


module( "Parameters", {} );


test( "Substitutions", function( assert ) {

	var foo = new Substitution( "foo", "foo" );
	var bar = new Substitution( "bar", "bar" );
	var baz = new Substitution( "baz", "baz" );
	var foobar = new Substitution( [ "foo", "bar" ], "foobar" );


	assert.equal(
		subst( { foo: "foo" }, foo, "{bar}" ),
		"{bar}",
		"Invalid variable"
	);

	assert.equal(
		subst( {}, foo, "{foo}" ),
		"{foo}",
		"Unknown property"
	);

	assert.deepEqual(
		[
			subst( { foo: "foo" }, foo, "{foo}" ),
			subst( { bar: "bar" }, bar, "{bar}" ),
			subst( { baz: "baz" }, baz, "{baz}" )
		],
		[
			"foo",
			"bar",
			"baz"
		],
		"Simple variables"
	);

	assert.equal(
		subst( { foobar: "foobar" }, foobar, "{foo}{bar}" ),
		"foobarfoobar",
		"Multiple variables"
	);

	assert.equal(
		subst( { foo: "foo" }, foo, "{FOO}" ),
		"foo",
		"Case insensitive variables"
	);

	assert.equal(
		subst(
			{ foo: "foo", bar: "bar", baz: "baz" },
			[ foo, bar, baz ],
			"{foo}{bar}{baz}"
		),
		"foobarbaz",
		"Substitution list"
	);

	assert.equal(
		subst( { foo: "bar" }, foo, "{{foo}}" ),
		"{{foo}}",
		"Ignore escaped variables"
	);

	assert.equal(
		subst(
			{ foo: "{bar}", bar: "{baz}", baz: "{foo}" },
			[ foo, bar, baz ],
			"{foo}{bar}{baz}"
		),
		"{bar}{baz}{foo}",
		"Don't parse substituted variables again"
	);

	assert.equal(
		subst( { foo: '";rm -rf / --preserve-root'  }, foo, '"{foo}"', true ),
		'"\\";rm -rf / --preserve-root"',
		"Escape double-quotes inside a double-quotes string"
	);

	assert.equal(
		subst( { foo: "';rm -rf / --preserve-root"  }, foo, "'{foo}'", true ),
		"'\\';rm -rf / --preserve-root'",
		"Escape single-quotes inside a single-quotes string"
	);

	assert.equal(
		subst( { foo: ";rm -rf / --preserve-root"  }, foo, '{foo}', true ),
		'\\;\\r\\m\\ \\-\\r\\f\\ \\/\\ \\-\\-\\p\\r\\e\\s\\e\\r\\v\\e\\-\\r\\o\\o\\t',
		"Escape every character everywhere else"
	);

	assert.equal(
		subst( { foo: "\\" }, foo, '"{foo}"', true ),
		'"\\\\"',
		"Don't break strings with tailing escape characters"
	);

});


test( "Parameters", function( assert ) {

	var obj = {
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

	var a = new Parameter( "--a", null, null );

	var b = new Parameter( "--b", null, "b" );
	var c = new Parameter( "--c", null, "unkown" );

	var d = new Parameter( "--d", null, "d" );
	var e = new Parameter( "--e", null, "e" );

	var f = new Parameter( "--f", "valid", "a" );
	var g = new Parameter( "--g", "invalid", null );
	var h = new Parameter( "--h", condition, "a" );
	var i = new Parameter( "--i", [ "valid", "valid" ], "a" );


	assert.deepEqual(
		getParams( obj, [] ),
		[],
		"No parameters"
	);

	assert.deepEqual(
		getParams( obj, [ a ] ),
		[ "--a" ],
		"Simple single parameter"
	);

	assert.deepEqual(
		getParams( obj, [ a, a, a ] ),
		[ "--a", "--a", "--a" ],
		"Simple multiple parameter"
	);

	assert.deepEqual(
		getParams( obj, [ b ] ),
		[ "--b", "b" ],
		"Single parameter with value"
	);

	assert.deepEqual(
		getParams( obj, [ c ] ),
		[],
		"Parameter with invalid value"
	);

	assert.deepEqual(
		getParams( obj, [ b, a, b ] ),
		[ "--b", "b", "--a", "--b", "b" ],
		"Multiple parameters with value"
	);

	assert.deepEqual(
		getParams( obj, [ d, e ] ),
		[ "--d", "foo bar", "--e", "\"foo\" \"bar\"" ],
		"Multiple parameters with complex values"
	);

	assert.deepEqual(
		getParams( obj, [ f ] ),
		[ "--f", "a" ],
		"Valid conditional parameter"
	);

	assert.deepEqual(
		getParams( obj, [ g ] ),
		[],
		"Invalid conditional parameter"
	);

	assert.deepEqual(
		getParams( obj, [ h ] ),
		[ "--h", "a" ],
		"Dynamic conditional parameter"
	);

	assert.deepEqual(
		getParams( obj, [ i ] ),
		[ "--i", "a" ],
		"Multiple conditions"
	);

});


test( "Substituted parameters", function( assert ) {

	var obj = {
		foo: "f o o",
		bar: "b a r",
		baz: "b a z",
		param: "{foo} \"{bar}\" \'{baz}\'",

		title: "foo\'s \"bar\" \\",
		paramTitleA: "--title \"{title}\"",
		paramTitleB: "--title \'{title}\'",
		paramTitleC: "--title {title}",

		curlies: "{foo} {{bar}} {{{baz}}} {{qux} {quux}}",
		paramCurlies: "\"{curlies}\""
	};

	var foo = new Substitution( "foo", "foo" );
	var bar = new Substitution( "bar", "bar" );
	var baz = new Substitution( "baz", "baz" );
	var title = new Substitution( "title", "title" );
	var curlies = new Substitution( "curlies", "curlies" );

	var param = new Parameter( "--param", null, "param", [ foo, bar, baz ] );

	var paramTitleA = new Parameter( "--player-args", null, "paramTitleA", [ title ] );
	var paramTitleB = new Parameter( "--player-args", null, "paramTitleB", [ title ] );
	var paramTitleC = new Parameter( "--player-args", null, "paramTitleC", [ title ] );
	var paramTitleD = new Parameter( "-a", null, "paramCurlies", [ curlies ] );

	assert.deepEqual(
		getParams( obj, [ param ] ),
		[ "--param", "\\f\\ \\o\\ \\o \"b a r\" \'b a z\'" ],
		"Parameter value substitution"
	);

	assert.deepEqual(
		getParams( obj, [ paramTitleA ] ),
		[ "--player-args", "--title \"foo's \\\"bar\\\" \\\\\"" ],
		"Only escape double quote chars in double quote strings"
	);

	assert.deepEqual(
		getParams( obj, [ paramTitleB ] ),
		[ "--player-args", "--title \'foo\\\'s \"bar\" \\\\\'" ],
		"Only escape single quote chars in single quote strings"
	);

	assert.deepEqual(
		getParams( obj, [ paramTitleC ] ),
		[ "--player-args", "--title \\f\\o\\o\\\'\\s\\ \\\"\\b\\a\\r\\\"\\ \\\\" ],
		"Escape all chars"
	);

	assert.deepEqual(
		getParams( obj, [ paramTitleD ] ),
		[ "-a", "\"{{foo}} {{{{bar}}}} {{{{{{baz}}}}}} {{{{qux}} {{quux}}}}\"" ],
		"Escape curly braces"
	);

});


test( "Custom parameters", function( assert ) {

	var obj = {
		a: "--foo --bar",
		b: "--foo foo --bar bar",
		c: "--foo \"foo bar\" --bar 'baz qux'",
		d: "--foo \"'foo'\"",
		e: "--foo \"foo \\\"bar\\\"\" --bar 'baz \\'qux\\''",
		f: "--foo \"foo",
		g: "--foo \\a\\"
	};
	var a = new ParameterCustom( null, "a" );
	var b = new ParameterCustom( null, "b" );
	var c = new ParameterCustom( null, "c" );
	var d = new ParameterCustom( null, "d" );
	var e = new ParameterCustom( null, "e" );
	var f = new ParameterCustom( null, "f" );
	var g = new ParameterCustom( null, "g" );

	assert.deepEqual(
		getParams( obj, [ a ] ),
		[ "--foo", "--bar" ],
		"Basic tokenization"
	);

	assert.deepEqual(
		getParams( obj, [ b ] ),
		[ "--foo", "foo", "--bar", "bar" ],
		"Basic tokenization with parameter values"
	);

	assert.deepEqual(
		getParams( obj, [ c ] ),
		[ "--foo", "foo bar", "--bar", "baz qux" ],
		"Quoted tokenization with parameter values"
	);

	assert.deepEqual(
		getParams( obj, [ d ] ),
		[ "--foo", "'foo'" ],
		"Quotation marks inside quoted parameter values"
	);

	assert.deepEqual(
		getParams( obj, [ e ] ),
		[ "--foo", "foo \"bar\"", "--bar", "baz 'qux'" ],
		"Escaped quotation marks inside quoted parameter values"
	);

	assert.deepEqual(
		getParams( obj, [ f ] ),
		[ "--foo", "\"foo" ],
		"Missing closing quotation mark"
	);

	assert.deepEqual(
		getParams( obj, [ g ] ),
		[ "--foo", "\\a\\" ],
		"Invalid escaping backslashes"
	);

});
