import { module, test } from "qunit";

import spawnInjector from "inject-loader!utils/node/child_process/spawn";


module( "utils/node/child_process/spawn" );


test( "Merges the process.env object", assert => {

	assert.expect( 11 );

	let callback;
	let spawncmd;
	let spawnparams;
	let spawnoptions;

	const spawn = spawnInjector({
		"nwjs/process": {
			env: {
				foo: "foo"
			}
		},
		"child_process": {
			spawn( ...args ) {
				callback( ...args );
			}
		}
	})[ "default" ];

	spawncmd = "foo";
	spawnparams = [ "bar", "baz" ];
	callback = ( cmd, params, opts ) => {
		assert.strictEqual( cmd, spawncmd, "Uses the correct command" );
		assert.strictEqual( params, spawnparams, "Uses the correct params" );
		assert.ok( opts instanceof Object, "Uses an options object" );
		assert.notStrictEqual( opts, spawnoptions, "Uses a different options object" );
	};
	spawn( spawncmd, spawnparams );

	spawnoptions = {
		detached: true
	};
	callback = ( cmd, params, opts ) => {
		assert.ok( opts instanceof Object, "Uses an options object" );
		assert.notStrictEqual( opts, spawnoptions, "Uses a different options object" );
		assert.propEqual( opts, spawnoptions, "Both objects have the same properties" );
	};
	spawn( spawncmd, spawnparams, spawnoptions );

	spawnoptions = {
		detached: true,
		env: {
			bar: "bar"
		}
	};
	callback = ( cmd, params, opts ) => {
		assert.ok( opts instanceof Object, "Uses an options object" );
		assert.notStrictEqual( opts, spawnoptions, "Uses a different options object" );
		assert.notPropEqual( opts, spawnoptions, "Both objects don't have the same properties" );
		assert.propEqual(
			opts.env,
			{ foo: "foo", bar: "bar" },
			"Merges the options.env object with process.env"
		);
	};
	spawn( spawncmd, spawnparams, spawnoptions );

});
