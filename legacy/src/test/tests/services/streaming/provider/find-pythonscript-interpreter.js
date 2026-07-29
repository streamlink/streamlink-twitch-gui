import { module, test } from "qunit";
import sinon from "sinon";
import { EventEmitter } from "events";
import { posix as pathPosix, win32 as pathWin32 } from "path";

import readLinesInjector from "inject-loader?fs!utils/node/fs/readLines";
import findPythonscriptInterpreterInjector
	from "inject-loader!services/streaming/provider/find-pythonscript-interpreter";
import ExecObj from "services/streaming/exec-obj";


module( "services/streaming/provider/find-pythonscript-interpreter", {
	beforeEach() {
		class ReadStream extends EventEmitter {
			close() {}
		}

		this.contents = {};
		this.createReadStreamStub = sinon.stub().callsFake( file => {
			const readStream = new ReadStream();

			process.nextTick( () => {
				if ( this.contents[ file ] ) {
					readStream.emit( "data", this.contents[ file ] );
				}
				readStream.emit( "end" );
			});

			return readStream;
		});
		this.whichFallbackStub = sinon.stub();

		this.subject = isWin => findPythonscriptInterpreterInjector({
			"../exec-obj": ExecObj,
			"utils/node/fs/readLines": readLinesInjector({
				fs: {
					createReadStream: this.createReadStreamStub
				}
			}),
			"utils/node/fs/whichFallback": this.whichFallbackStub,
			"utils/node/platform": {
				isWin: !!isWin
			},
			"path": isWin
				? pathWin32
				: pathPosix
		})[ "default" ];
	}
});


test( "Invalid content", async function( assert ) {

	this.contents = {
		"/file1": "",
		"/file2": "foo\n\n\n",
		"/file3": "foo\n\n\n"
	};

	const subject = this.subject();

	// empty file
	await assert.rejects(
		subject( "/file1", "exec" ),
		new Error( "Invalid python script" ),
		"Throws an error on missing file content"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/file1" ), "Reads correct file" );
	this.createReadStreamStub.resetHistory();

	// invalid content
	await assert.rejects(
		subject( "/foo/bar", "exec" ),
		new Error( "Invalid python script" ),
		"Throws an error on invalid file content"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/foo/bar" ), "Reads correct file" );
	this.createReadStreamStub.resetHistory();

	// invalid content + custom exec
	assert.propEqual(
		await subject( "/file3", "exec", "custom-exec" ),
		new ExecObj(),
		"Returns an empty exec object on invalid file content when a custom exec was set"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/file3" ), "Reads correct file" );

});


test( "Pythonscript shebang POSIX", async function( assert ) {

	this.contents = {
		"/file1": "#!/foo/bar/baz\n",
		"/file2": "#!/foo/bar/baz\n",
		"/file3": "#!/usr/bin/env foo\n"
	};

	const subject = this.subject();
	const error = new Error( "foo" );

	// reject if executable from shebang doesn't exist
	this.whichFallbackStub.rejects( error );
	await assert.rejects(
		subject( "/file1", { exec: "exec", fallback: "/fallback" } ),
		error,
		"Rejects with whichFallback error if executable doesn't exist"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/file1" ), "Reads correct file" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"/foo/bar/baz",
			"/fallback",
			null,
			false
		]],
		"Checks the explicit path"
	);
	this.whichFallbackStub.reset();

	// resolve explicit executable from shebang
	this.whichFallbackStub.callsFake( async exec => exec );
	assert.propEqual(
		await subject( "/file2", { exec: "exec", fallback: "/fallback" } ),
		{
			exec: "/foo/bar/baz",
			params: null,
			env: null
		},
		"Returns the correct explicit path"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/file2" ), "Reads correct file" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"/foo/bar/baz",
			"/fallback",
			null,
			false
		]],
		"Checks the explicit path"
	);
	this.whichFallbackStub.reset();

	// resolve implicit executable from shebang
	this.whichFallbackStub.callsFake( async ( exec, fallback ) => `${fallback}/${exec}` );
	assert.propEqual(
		await subject( "/file3", { exec: "exec", fallback: "/fallback" } ),
		{
			exec: "/fallback/foo",
			params: null,
			env: null
		},
		"Returns the correct exec path"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "/file3" ), "Reads correct file" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"foo",
			"/fallback",
			null,
			false
		]],
		"Checks the implicit path"
	);

});


test( "Pythonscript shebang win32", async function( assert ) {

	this.contents = {
		"C:\\file1": "#!\"C:\\foo\\bar\\baz\"\n",
		"C:\\file2": "#!\"C:\\foo\\bar\\baz\"\n"
	};

	const subject = this.subject( true );
	const error = new Error( "foo" );

	// resolve executable from shebang path
	this.whichFallbackStub.callsFake( async ( exec, path ) => `${path}\\${exec}` );
	assert.propEqual(
		await subject( "C:\\file1", { exec: "exec", fallback: "C:\\fallback" } ),
		{
			exec: "C:\\foo\\bar\\exec",
			params: null,
			env: null
		},
		"Resolves default exec from shebang dirname"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "C:\\file1" ), "Reads correct file" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"exec",
			"C:\\foo\\bar",
			null,
			true
		]],
		"Only looks up exec in the fallback dir"
	);
	this.whichFallbackStub.reset();

	// resolve executable regularly if it doesn't exist in shebang dir
	this.whichFallbackStub.onCall( 0 ).rejects( error );
	this.whichFallbackStub.onCall( 1 ).callsFake( async ( exec, fallback ) => {
		return `${fallback}\\${exec}`;
	});
	assert.propEqual(
		await subject( "C:\\file2", { exec: "exec", fallback: "C:\\fallback" } ),
		{
			exec: "C:\\fallback\\baz",
			params: null,
			env: null
		},
		"Resolves exec from fallback if it doesn't exist in shebang path"
	);
	assert.ok( this.createReadStreamStub.calledWithExactly( "C:\\file2" ), "Reads correct file" );
	assert.propEqual(
		this.whichFallbackStub.args,
		[
			[
				"exec",
				"C:\\foo\\bar",
				null,
				true
			],
			[
				"baz",
				"C:\\fallback",
				null,
				false
			]
		],
		"Only looks up exec in the fallback dir"
	);

});


test( "Bash wrapper script", async function( assert ) {

	this.contents = {
		"/file1": "#!/bin/bash        \nPYTHONPATH=\"foobar\" exec \"/script\" \"$@\"\n",
		"/file2": "#!/usr/bin/env bash\nPYTHONPATH=\"foobar\" exec \"/script\" \"$@\"\n",
		"/file3": "#!/usr/bin/env bash\nPYTHONPATH=\"foobar\" exec \"/file1\" \"$@\"\n",
		"/file4": "#!/usr/bin/env bash\nnot a bash wrapper script\n",
		"/script": "#!/path/to/python\n"
	};

	const subject = this.subject();

	this.whichFallbackStub.callsFake( async exec => exec );

	// resolve first file
	assert.propEqual(
		await subject( "/file1", { exec: "exec", fallback: "/fallback" } ),
		{
			exec: "/path/to/python",
			params: [ "/script" ],
			env: {
				PYTHONPATH: "foobar"
			}
		},
		"Returns the correct exec object (explicit shebang)"
	);
	assert.propEqual(
		this.createReadStreamStub.args,
		[
			[ "/file1" ],
			[ "/script" ]
		],
		"Reads correct files"
	);
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"/path/to/python",
			"/fallback",
			null,
			false
		]],
		"Resolves python executable"
	);
	this.createReadStreamStub.resetHistory();
	this.whichFallbackStub.resetHistory();

	// resolve second file
	assert.propEqual(
		await subject( "/file2", { exec: "exec", fallback: "/fallback" } ),
		{
			exec: "/path/to/python",
			params: [ "/script" ],
			env: {
				PYTHONPATH: "foobar"
			}
		},
		"Returns the correct exec object (env shebang)"
	);
	assert.propEqual(
		this.createReadStreamStub.args,
		[
			[ "/file2" ],
			[ "/script" ]
		],
		"Reads correct files"
	);
	assert.propEqual(
		this.whichFallbackStub.args,
		[[
			"/path/to/python",
			"/fallback",
			null,
			false
		]],
		"Resolves python executable"
	);
	this.createReadStreamStub.resetHistory();
	this.whichFallbackStub.resetHistory();

	// reject chained bash wrapper scripts
	await assert.rejects(
		subject( "/file3", { exec: "exec", fallback: "/fallback" } ),
		new Error( "Invalid python script" ),
		"Rejects on invalid bash wrapper scripts"
	);
	assert.propEqual(
		this.createReadStreamStub.args,
		[
			[ "/file3" ],
			[ "/file1" ]
		],
		"Reads correct files"
	);
	assert.ok( this.whichFallbackStub.notCalled, "Doesn't call whichFallback" );
	this.createReadStreamStub.resetHistory();

	// reject malformed bash wrapper scripts
	await assert.rejects(
		subject( "/file4", { exec: "exec", fallback: "/fallback" } ),
		new Error( "Invalid python script" ),
		"Rejects on invalid bash wrapper scripts"
	);
	assert.propEqual(
		this.createReadStreamStub.args,
		[[ "/file4" ]],
		"Reads correct files"
	);
	assert.ok( this.whichFallbackStub.notCalled, "Doesn't call whichFallback" );

});
