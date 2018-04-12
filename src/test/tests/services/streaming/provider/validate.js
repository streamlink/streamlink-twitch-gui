import { module, test } from "qunit";
import { EventEmitter } from "events";
import sinon from "sinon";

import { streaming as streamingConfig } from "config";
import validateProviderInjector from "inject-loader!services/streaming/provider/validate";
import { LogError, VersionError } from "services/streaming/errors";
import { getMax } from "utils/semver";
import StreamOutputBuffer from "utils/StreamOutputBuffer";


const { validation: { providers: validationProviders } } = streamingConfig;


module( "services/streaming/provider/validate", {
	beforeEach() {
		this.clock = sinon.useFakeTimers({
			target: window
		});

		class ChildProcess extends EventEmitter {
			constructor() {
				super();
				this.stdout = new EventEmitter();
				this.stderr = new EventEmitter();
				this.killed = false;
			}

			kill() {}
		}

		this.spawnStub = sinon.stub().callsFake( () => {
			this.child = new ChildProcess();
			this.childKillSpy = sinon.spy( this.child, "kill" );

			return this.child;
		});

		this.providers = Object.assign( {}, validationProviders );

		const { default: validateProvider } = validateProviderInjector({
			"config": {
				streaming: {
					validation: {
						timeout: 1000,
						providers: this.providers
					}
				}
			},
			"../errors": {
				LogError,
				VersionError
			},
			"../spawn": this.spawnStub,
			"utils/semver": {
				getMax
			},
			"utils/StreamOutputBuffer": StreamOutputBuffer
		});

		this.validateProvider = validateProvider;
	},

	afterEach() {
		this.clock.restore();
	}
});


test( "Missing provider data", async function( assert ) {

	// temporarily remove provider data
	const providers = {};
	for ( const [ name, data ] of Object.entries( this.providers ) ) {
		providers[ name ] = data;
		delete this.providers[ name ];
	}

	await assert.rejects(
		this.validateProvider( {}, { type: "streamlink", flavor: "default" } ),
		new Error( "Missing provider validation data" ),
		"Throws error on missing provider validation data"
	);
	assert.notOk( this.spawnStub.called, "Doesn't spawn child process" );

	this.providers.streamlink = {};
	await assert.rejects(
		this.validateProvider( {}, { type: "streamlink", flavor: "default" } ),
		new Error( "Invalid provider validation data" ),
		"Throws error on invalid provider validation data"
	);
	assert.notOk( this.spawnStub.called, "Doesn't spawn child process" );

	// copy providers back
	for ( const [ name, data ] of Object.entries( providers ) ) {
		this.providers[ name ] = data;
	}

});


test( "Spawn error", async function( assert ) {

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.killed = true;
			this.child.emit( "error", new Error( "fail" ) );
			await promise;
		},
		new Error( "fail" ),
		"Rejects on error"
	);
	assert.notOk( this.childKillSpy.called, "Doesn't unnecessarily kill child on initial error" );

});


test( "Spawn parameters", async function( assert ) {

	try {
		const promise = this.validateProvider(
			{ exec: "foo" },
			{ type: "streamlink", flavor: "default" }
		);
		this.child.emit( "error", new Error( "fail" ) );
		await promise;
	} catch ( e ) {}

	assert.propEqual(
		this.spawnStub.args,
		[[
			{ exec: "foo" },
			[ "--version", "--no-version-check" ]
		]],
		"Calls spawn with correct arguments"
	);

});


test( "Stdout error", async function( assert ) {

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.stdout.emit( "data", "foo\n" );
			await promise;
		},
		new LogError( "Invalid version check output", [] ),
		"Throws a LogError on unexpected output on stdout"
	);
	assert.propEqual( this.childKillSpy.args, [[ "SIGKILL" ]], "Kills child process" );

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.stdout.emit( "data", "streamlink 1.0.0\n\n" );
			await promise;
		},
		new LogError( "Unexpected version check output", [] ),
		"Throws a LogError on unexpected output on stdout"
	);
	assert.propEqual( this.childKillSpy.args, [[ "SIGKILL" ]], "Kills child process" );

});


test( "Stderr error", async function( assert ) {

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.stderr.emit( "data", "foo\n" );
			await promise;
		},
		new LogError( "Invalid version check output", [] ),
		"Throws a LogError on unexpected output on stderr"
	);
	assert.propEqual( this.childKillSpy.args, [[ "SIGKILL" ]], "Kills child process" );

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.stderr.emit( "data", "streamlink 1.0.0\n\n" );
			await promise;
		},
		new LogError( "Unexpected version check output", [] ),
		"Throws a LogError on unexpected output on stderr"
	);
	assert.propEqual( this.childKillSpy.args, [[ "SIGKILL" ]], "Kills child process" );

});


test( "Exit codes", async function( assert ) {

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.killed = true;
			this.child.emit( "exit", 0 );
			this.child.emit( "error", new Error( "no error" ) );
			await promise;
		},
		new Error( "no error" ),
		"Ignores exit code 0"
	);

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.child.killed = true;
			this.child.emit( "exit", 1 );
			await promise;
		},
		new Error( "Exit code 1" ),
		"Rejects on exit codes greater than 0"
	);
	assert.notOk( this.childKillSpy.called, "Doesn't unnecessarily kill child on exit code" );

});


test( "Timeout", async function( assert ) {

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, { type: "streamlink", flavor: "default" } );
			this.clock.tick( 2000 );
			await promise;
		},
		new Error( "Timeout" ),
		"Rejects on timeout"
	);
	assert.propEqual( this.childKillSpy.args, [[ "SIGKILL" ]], "Kills child process" );

});


test( "Version error", async function( assert ) {

	const streamlink = { type: "streamlink", flavor: "default" };
	const livestreamer = { type: "livestreamer", flavor: "default" };

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, streamlink );
			this.child.stderr.emit( "data", "streamlink 0.1.0\n" );
			await promise;
		},
		new VersionError( "0.1.0" ),
		"Throws a VersionError on old streamlink output"
	);

	await assert.rejects(
		async () => {
			const promise = this.validateProvider( {}, livestreamer );
			this.child.stderr.emit( "data", "livestreamer 1.11.0\n" );
			await promise;
		},
		new VersionError( "1.11.0" ),
		"Throws a VersionError on old livestreamer output"
	);

});


test( "Version match", async function( assert ) {

	const validate = async ( data, actual, expected, message ) => {
		const promise = this.validateProvider( {}, data );
		this.child.stderr.emit( "data", actual );
		const { version } = await promise;
		assert.strictEqual( version, expected, message );
	};

	// streamlink + livestreamer

	for ( const [ name, [ minVersion, provider ] ] of Object.entries({
		streamlink: [ "0.2.0", { type: "streamlink", flavor: "default" } ],
		livestreamer: [ "1.11.1", { type: "livestreamer", flavor: "default" } ]
	}) ) {
		await validate(
			provider,
			`${name} ${minVersion}\n`,
			minVersion,
			`Matches simple ${name} output`
		);
		await validate(
			provider,
			`${name}.exe ${minVersion}\n`,
			minVersion,
			`Matches ${name} exe on Windows`
		);
		await validate(
			provider,
			`${name}-script.py ${minVersion}\n`,
			minVersion,
			`Matches ${name} python script`
		);
		await validate(
			provider,
			`${name}-script.pyw ${minVersion}\n`,
			minVersion,
			`Matches ${name} python script on Windows`
		);
		await validate(
			provider,
			`python-${name} ${minVersion}\n`,
			minVersion,
			`Matches ${name} with script name containing python`
		);
		await validate(
			provider,
			`python3-${name} ${minVersion}\n`,
			minVersion,
			`Matches ${name} with script name containing specific python version`
		);
		await validate(
			provider,
			`${name} ${minVersion}-1\n`,
			minVersion,
			`Matches ${name} output with pre-release information`
		);
		await validate(
			provider,
			`${name} ${minVersion}+gdeadbeef\n`,
			minVersion,
			`Matches ${name} output with build information`
		);
		await validate(
			provider,
			`${name} ${minVersion}-1+gdeadbeef\n`,
			minVersion,
			`Matches ${name} output with pre-release and build information`
		);
		await validate(
			provider,
			`${name} ${minVersion} foobar\n`,
			minVersion,
			`Matches ${name} output with additional content`
		);
	}


	// livestreamer standalone

	const livestreamerStandalone = { type: "livestreamer", flavor: "standalone" };

	await validate(
		livestreamerStandalone,
		"livestreamer 1.11.1\n",
		"1.11.1",
		"Matches simple livestreamer standalone output"
	);
	await validate(
		livestreamerStandalone,
		"livestreamer.exe 1.11.1\n",
		"1.11.1",
		"Matches livestreamer standaline exe output"
	);

});
