/* jshint quotmark:false */
define( [ "ember", "models/Livestreamer" ], function( Ember, Livestreamer ) {

	var _;

	module( "Livestreamer parameters", {
		"setup": function() {
			_ = Livestreamer.create({
				channel: {
					display_name: "foo",
					status      : "bar"
				},
				stream: {
					game: "baz"
				}
			});
		},
		"teardown": function() {
			_ = null;
		}
	});


	test( "Parameter variable parsing", function() {

		equal(
			_.substitute( "{foo}" ),
			"{foo}",
			"Invalid variables"
		);

		deepEqual(
			[
				_.substitute( "{name}" ),
				_.substitute( "{channel}" ),
				_.substitute( "{title}" ),
				_.substitute( "{status}" ),
				_.substitute( "{game}" ),
				_.substitute( "{name}{status}{game}" )
			],
			[
				"foo",
				"foo",
				"bar",
				"bar",
				"baz",
				"foobarbaz"
			],
			"Simple variables"
		);

		equal(
			_.substitute( "{name}" ),
			"foo",
			"Case insensitive parameters"
		);

		_.channel.status = '";rm -rf / --preserve-root';
		equal(
			_.substitute( '"{status}"' ),
			'"\\";rm -rf / --preserve-root"',
			"String escaping 1"
		);

		_.channel.status = "';rm -rf / --preserve-root";
		equal(
			_.substitute( "'{status}'" ),
			"'\\';rm -rf / --preserve-root'",
			"String escaping 2"
		);

		_.channel.status = "`rm -rf / --preserve-root`";
		equal(
			_.substitute( '"{status}"' ),
			'"\\`rm -rf / --preserve-root\\`"',
			"String escaping 3"
		);

		_.channel.status = "$(rm -rf / --preserve-root)";
		equal(
			_.substitute( '"{status}"' ),
			'"\\$(rm -rf / --preserve-root)"',
			"String escaping 4"
		);

	});

});
