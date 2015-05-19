/* jshint quotmark:false */
define([
	"ember",
	"utils/Parameter",
	"utils/ParameterCustom",
	"utils/Substitution"
], function(
	Ember,
	Parameter,
	ParameterCustom,
	Substitution
) {

	module( "Parameters" );


	test( "Substitutions", function() {

		var foo = new Substitution( "foo", "foo" );
		var bar = new Substitution( "bar", "bar" );
		var baz = new Substitution( "baz", "baz" );
		var foobar = new Substitution( [ "foo", "bar" ], "foobar" );


		equal(
			Substitution.substitute( "{bar}", foo, { foo: "foo" } ),
			"{bar}",
			"Invalid variable"
		);

		equal(
			Substitution.substitute( "{foo}", foo, {} ),
			"{foo}",
			"Unknown property"
		);

		deepEqual(
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

		equal(
			Substitution.substitute( "{foo}{bar}", foobar, { foobar: "foobar" } ),
			"foobarfoobar",
			"Multiple variables"
		);

		equal(
			Substitution.substitute( "{FOO}", foo, { foo: "foo" } ),
			"foo",
			"Case insensitive variables"
		);

		equal(
			Substitution.substitute(
				"{foo}{bar}{baz}",
				[ foo, bar, baz ],
				{ foo: "foo", bar: "bar", baz: "baz" }
			),
			"foobarbaz",
			"Substitution list"
		);

		equal(
			Substitution.substitute(
				"{foo}{bar}{baz}",
				[ foo, bar, baz ],
				{ foo: "{bar}", bar: "{baz}", baz: "{foo}" }
			),
			"{bar}{baz}{foo}",
			"Don't parse substituted variables again"
		);

		deepEqual(
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


	test( "Parameters", function() {

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


		deepEqual(
			Parameter.getParameters( obj, [], [] ),
			[],
			"No parameters"
		);

		deepEqual(
			Parameter.getParameters( obj, [ a ], [] ),
			[ "--a" ],
			"Simple single parameter"
		);

		deepEqual(
			Parameter.getParameters( obj, [ a, a, a ], [] ),
			[ "--a", "--a", "--a" ],
			"Simple multiple parameter"
		);

		deepEqual(
			Parameter.getParameters( obj, [ b ], [] ),
			[ "--b", "b" ],
			"Single parameter with value"
		);

		deepEqual(
			Parameter.getParameters( obj, [ c ], [] ),
			[],
			"Parameter with invalid value"
		);

		deepEqual(
			Parameter.getParameters( obj, [ b, a, b ], [] ),
			[ "--b", "b", "--a", "--b", "b" ],
			"Multiple parameters with value"
		);

		deepEqual(
			Parameter.getParameters( obj, [ d, e ], [] ),
			[ "--d", "foo bar", "--e", "\"foo\" \"bar\"" ],
			"Multiple parameters with complex values"
		);

		deepEqual(
			Parameter.getParameters( obj, [ f ], [] ),
			[ "--f", "a" ],
			"Valid conditional parameter"
		);

		deepEqual(
			Parameter.getParameters( obj, [ g ], [] ),
			[],
			"Invalid conditional parameter"
		);

		deepEqual(
			Parameter.getParameters( obj, [ h ], [] ),
			[ "--h", "a" ],
			"Dynamic conditional parameter"
		);

		deepEqual(
			Parameter.getParameters( obj, [ i ], [] ),
			[ "--i", "a" ],
			"Multiple conditions"
		);

		deepEqual(
			Parameter.getParameters( obj, [ j ], [ foo, bar, baz ] ),
			[ "--j", "a b c" ],
			"Parameter value substitution"
		);

		deepEqual(
			Parameter.getParameters( obj, [ k ], [ qux ] ),
			[ "--k", "\\\"foo\\\" \\\"bar\\\"" ],
			"Escaped parameter value substitution"
		);

		deepEqual(
			Parameter.getParameters( obj, [ l ], [ foo, bar, baz ] ),
			[ "--l", "{foo} {bar} {baz}" ],
			"Disabled parameter value substitution"
		);

	});


	test( "Custom parameters", function() {

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

		deepEqual(
			Parameter.getParameters( obj, [ a ] ),
			[ "--foo", "--bar" ],
			"Basic tokenization"
		);

		deepEqual(
			Parameter.getParameters( obj, [ b ] ),
			[ "--foo", "foo", "--bar", "bar" ],
			"Basic tokenization with parameter values"
		);

		deepEqual(
			Parameter.getParameters( obj, [ c ] ),
			[ "--foo", "foo bar", "--bar", "baz qux" ],
			"Quoted tokenization with parameter values"
		);

		deepEqual(
			Parameter.getParameters( obj, [ d ] ),
			[ "--foo", "'foo'" ],
			"Quotation marks inside quoted parameter values"
		);

		deepEqual(
			Parameter.getParameters( obj, [ e ] ),
			[ "--foo", "foo \"bar\"", "--bar", "baz 'qux'" ],
			"Escaped quotation marks inside quoted parameter values"
		);

		deepEqual(
			Parameter.getParameters( obj, [ f ] ),
			[ "--foo", "\"foo" ],
			"Missing closing quotation mark"
		);

		deepEqual(
			Parameter.getParameters( obj, [ g ] ),
			[ "--foo", "\\a\\" ],
			"Invalid escaping backslashes"
		);

	});

});
