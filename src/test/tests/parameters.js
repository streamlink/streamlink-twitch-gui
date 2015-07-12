/* jshint quotmark:false */
define([
	"Ember",
	"utils/Parameter",
	"utils/ParameterCustom",
	"utils/Substitution"
], function(
	Ember,
	Parameter,
	ParameterCustom,
	Substitution
) {

	QUnit.module( "Parameters" );


	QUnit.test( "Substitutions", function( assert ) {

		var foo = new Substitution( "foo", "foo" );
		var bar = new Substitution( "bar", "bar" );
		var baz = new Substitution( "baz", "baz" );
		var foobar = new Substitution( [ "foo", "bar" ], "foobar" );


		assert.equal(
			Substitution.substitute( "{bar}", foo, { foo: "foo" } ),
			"{bar}",
			"Invalid variable"
		);

		assert.equal(
			Substitution.substitute( "{foo}", foo, {} ),
			"{foo}",
			"Unknown property"
		);

		assert.deepEqual(
			[
				Substitution.substitute( "{foo}", foo, { foo: "foo" } ),
				Substitution.substitute( "{bar}", bar, { bar: "bar" } ),
				Substitution.substitute( "{baz}", baz, { baz: "baz" } )
			],
			[
				"foo",
				"bar",
				"baz"
			],
			"Simple variables"
		);

		assert.equal(
			Substitution.substitute( "{foo}{bar}", foobar, { foobar: "foobar" } ),
			"foobarfoobar",
			"Multiple variables"
		);

		assert.equal(
			Substitution.substitute( "{FOO}", foo, { foo: "foo" } ),
			"foo",
			"Case insensitive variables"
		);

		assert.equal(
			Substitution.substitute(
				"{foo}{bar}{baz}",
				[ foo, bar, baz ],
				{ foo: "foo", bar: "bar", baz: "baz" }
			),
			"foobarbaz",
			"Substitution list"
		);

		assert.equal(
			Substitution.substitute( "{foo}", foo, { foo: "{foo}" } ),
			"{{foo}}",
			"Escape curly brackets"
		);

		assert.equal(
			Substitution.substitute(
				"{foo}{bar}{baz}",
				[ foo, bar, baz ],
				{ foo: "{bar}", bar: "{baz}", baz: "{foo}" }
			),
			"{{bar}}{{baz}}{{foo}}",
			"Don't parse substituted variables again"
		);

		assert.deepEqual(
			[
				Substitution.substitute( '"{foo}"', foo, { foo: '";rm -rf / --preserve-root' } ),
				Substitution.substitute( "'{foo}'", foo, { foo: "';rm -rf / --preserve-root" } ),
				Substitution.substitute( '"{foo}"', foo, { foo: "`rm -rf / --preserve-root`" } ),
				Substitution.substitute( '"{foo}"', foo, { foo: "$(rm -rf / --preserve-root)" } ),
				Substitution.substitute( '"{foo}"', foo, { foo: "\\" } )
			],
			[
				'"\\";rm -rf / --preserve-root"',
				"'\\';rm -rf / --preserve-root'",
				'"\\`rm -rf / --preserve-root\\`"',
				'"\\$(rm -rf / --preserve-root)"',
				'"\\\\"'
			],
			"String escaping"
		);

	});


	QUnit.test( "Parameters", function( assert ) {

		var obj = {
			a: "a",
			b: "b",
			c: "c",
			d: "foo bar",
			e: "\"foo\" \"bar\"",
			valid: true,
			invalid: false,
			j: "{foo} {bar} {baz}",
			k: "{qux}"
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

		var j = new Parameter( "--j", null, "j", true );
		var k = new Parameter( "--k", null, "k", true );
		var l = new Parameter( "--l", null, "j", false );

		var foo = new Substitution( "foo", "a" );
		var bar = new Substitution( "bar", "b" );
		var baz = new Substitution( "baz", "c" );
		var qux = new Substitution( "qux", "e" );


		assert.deepEqual(
			Parameter.getParameters( obj, [], [] ),
			[],
			"No parameters"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ a ], [] ),
			[ "--a" ],
			"Simple single parameter"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ a, a, a ], [] ),
			[ "--a", "--a", "--a" ],
			"Simple multiple parameter"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ b ], [] ),
			[ "--b", "b" ],
			"Single parameter with value"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ c ], [] ),
			[],
			"Parameter with invalid value"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ b, a, b ], [] ),
			[ "--b", "b", "--a", "--b", "b" ],
			"Multiple parameters with value"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ d, e ], [] ),
			[ "--d", "foo bar", "--e", "\"foo\" \"bar\"" ],
			"Multiple parameters with complex values"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ f ], [] ),
			[ "--f", "a" ],
			"Valid conditional parameter"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ g ], [] ),
			[],
			"Invalid conditional parameter"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ h ], [] ),
			[ "--h", "a" ],
			"Dynamic conditional parameter"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ i ], [] ),
			[ "--i", "a" ],
			"Multiple conditions"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ j ], [ foo, bar, baz ] ),
			[ "--j", "a b c" ],
			"Parameter value substitution"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ k ], [ qux ] ),
			[ "--k", "\\\"foo\\\" \\\"bar\\\"" ],
			"Escaped parameter value substitution"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ l ], [ foo, bar, baz ] ),
			[ "--l", "{foo} {bar} {baz}" ],
			"Disabled parameter value substitution"
		);

	});


	QUnit.test( "Custom parameters", function( assert ) {

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
			Parameter.getParameters( obj, [ a ] ),
			[ "--foo", "--bar" ],
			"Basic tokenization"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ b ] ),
			[ "--foo", "foo", "--bar", "bar" ],
			"Basic tokenization with parameter values"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ c ] ),
			[ "--foo", "foo bar", "--bar", "baz qux" ],
			"Quoted tokenization with parameter values"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ d ] ),
			[ "--foo", "'foo'" ],
			"Quotation marks inside quoted parameter values"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ e ] ),
			[ "--foo", "foo \"bar\"", "--bar", "baz 'qux'" ],
			"Escaped quotation marks inside quoted parameter values"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ f ] ),
			[ "--foo", "\"foo" ],
			"Missing closing quotation mark"
		);

		assert.deepEqual(
			Parameter.getParameters( obj, [ g ] ),
			[ "--foo", "\\a\\" ],
			"Invalid escaping backslashes"
		);

	});

});
