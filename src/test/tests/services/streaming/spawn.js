import { module, test } from "qunit";

import spawnInjector from "inject-loader!services/streaming/spawn";
import ExecObj from "services/streaming/exec-obj";


module( "services/streaming/spawn" );


test( "Merge parameters and options", assert => {

	assert.expect( 3 );

	let callback;
	let execObj;

	const spawn = spawnInjector({
		"./logger": {
			logDebug() {}
		},
		"utils/node/child_process/spawn": function() {
			return callback( ...arguments );
		}
	})[ "default" ];

	callback = ( command, params, options ) => {
		assert.strictEqual( command, "foo", "Uses the correct command" );
		assert.deepEqual( params, [ "baz", "foo", "bar" ], "Appends the params" );
		assert.propEqual(
			options,
			{ detached: true, env: { foo: "bar", qux: "quux" } },
			"Merges the env options property"
		);
	};
	execObj = new ExecObj(
		"foo",
		[ "baz" ],
		{ qux: "quux" }
	);
	spawn( execObj, [ "foo", "bar" ], { detached: true, env: { foo: "bar" } } );

});
