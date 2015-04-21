/* jshint quotmark:false */
define([
	"ember",
	"utils/Parameter",
	"utils/Substitution"
], function( Ember, Parameter, Substitution ) {

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

});
