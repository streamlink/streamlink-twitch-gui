import { module, test } from "qunit";

import Parameter from "utils/parameters/Parameter";
import ParameterCustom from "utils/parameters/ParameterCustom";


const { getParameters } = Parameter;


module( "utils/parameters/ParameterCustom" );


test( "Custom parameters", function( assert ) {

	const obj = {
		a: "--foo --bar",
		b: "--foo foo --bar bar",
		c: "--foo \"foo bar\" --bar 'baz qux'",
		d: "--foo \"'foo'\"",
		e: "--foo \"foo \\\"bar\\\"\" --bar 'baz \\'qux\\''",
		f: "--foo \"foo",
		g: "--foo \\a\\"
	};
	const a = new ParameterCustom( null, "a" );
	const b = new ParameterCustom( null, "b" );
	const c = new ParameterCustom( null, "c" );
	const d = new ParameterCustom( null, "d" );
	const e = new ParameterCustom( null, "e" );
	const f = new ParameterCustom( null, "f" );
	const g = new ParameterCustom( null, "g" );

	assert.deepEqual(
		getParameters( obj, [ a ] ),
		[ "--foo", "--bar" ],
		"Basic tokenization"
	);

	assert.deepEqual(
		getParameters( obj, [ b ] ),
		[ "--foo", "foo", "--bar", "bar" ],
		"Basic tokenization with parameter values"
	);

	assert.deepEqual(
		getParameters( obj, [ c ] ),
		[ "--foo", "foo bar", "--bar", "baz qux" ],
		"Quoted tokenization with parameter values"
	);

	assert.deepEqual(
		getParameters( obj, [ d ] ),
		[ "--foo", "'foo'" ],
		"Quotation marks inside quoted parameter values"
	);

	assert.deepEqual(
		getParameters( obj, [ e ] ),
		[ "--foo", "foo \"bar\"", "--bar", "baz 'qux'" ],
		"Escaped quotation marks inside quoted parameter values"
	);

	assert.deepEqual(
		getParameters( obj, [ f ] ),
		[ "--foo", "\"foo" ],
		"Missing closing quotation mark"
	);

	assert.deepEqual(
		getParameters( obj, [ g ] ),
		[ "--foo", "\\a\\" ],
		"Invalid escaping backslashes"
	);

});
