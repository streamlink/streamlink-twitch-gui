import {
	module,
	test
} from "qunit";
import spawnInjector from "inject-loader!services/StreamingService/spawn";


module( "services/StreamingService/spawn" );


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
		assert.deepEqual( params, [ "bar", "foo", "bar" ], "Prepends the pythonscript param" );
		assert.propEqual(
			options,
			{ detached: true, env: { foo: "bar", qux: "quux" } },
			"Merges the env options property"
		);
	};
	execObj = {
		exec: "foo",
		pythonscript: "bar",
		env: {
			qux: "quux"
		}
	};
	spawn( execObj, [ "foo", "bar" ], { detached: true, env: { foo: "bar" } } );

});
