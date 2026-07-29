import { module, test } from "qunit";
import sinon from "sinon";
import { merge } from "lodash/object";

import resolvePlayerInjector from "inject-loader!services/streaming/player/resolve";
import { PlayerError } from "services/streaming/errors";
import ExecObj from "services/streaming/exec-obj";


module( "services/streaming/player/resolve", function( hooks ) {
	/** @typedef {Object} TestContextServicesStreamingPlayerResolve */

	const playerData = {
		mpv: {
			exec: {
				linux: "mpv"
			},
			fallback: {
				linux: [
					"/usr/bin"
				]
			},
			params: []
		}
	};

	hooks.beforeEach( /** @this {TestContextServicesStreamingPlayerResolve} */ function() {
		const context = this;

		this.players = {};
		this.isAbortedSpy = sinon.spy();
		this.playerCacheGetStub = sinon.stub().returns( null );
		this.playerCacheSetStub = sinon.stub();
		this.logDebugSpy = sinon.spy();
		this.whichFallbackStub = sinon.stub().resolves( null );

		const { default: resolvePlayer } = resolvePlayerInjector({
			"config": {
				get players() {
					return context.players;
				}
			},
			"../is-aborted": this.isAbortedSpy,
			"../cache": {
				playerCache: {
					get: this.playerCacheGetStub,
					set: this.playerCacheSetStub
				}
			},
			"../logger": {
				logDebug: this.logDebugSpy
			},
			"../errors": {
				PlayerError
			},
			"../exec-obj": ExecObj,
			"utils/node/platform": {
				platform: "linux"
			},
			"utils/node/fs/whichFallback": this.whichFallbackStub
		});
		this.resolvePlayer = resolvePlayer;
	});


	test( "Cached player data", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const cache = {};
		const stream = {};

		this.playerCacheGetStub.returns( cache );

		const result = await this.resolvePlayer( stream, "", {} );
		assert.strictEqual( result, cache, "Returns cache if it is available" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
	});

	test( "Default player profile - no user config", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		const expected = {
			exec: null,
			env: null,
			params: null
		};
		const result = await this.resolvePlayer( stream, "default", {} );
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.propEqual( this.playerCacheSetStub.args, [ [ expected ] ], "Sets player cache" );
	});

	test( "Default player profile - custom exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		const expected = {
			exec: "foo",
			env: null,
			params: null
		};
		const result = await this.resolvePlayer( stream, "default", {
			"default": {
				exec: "foo"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.propEqual( this.playerCacheSetStub.args, [ [ expected ] ], "Sets player cache" );
	});

	test( "Default player profile - custom params", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		const expected = {
			exec: "foo",
			env: null,
			params: "bar"
		};
		const result = await this.resolvePlayer( stream, "default", {
			"default": {
				exec: "foo",
				args: "bar"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.propEqual( this.playerCacheSetStub.args, [ [ expected ] ], "Sets player cache" );
	});

	test( "Default player profile - custom params and no exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		const expected = {
			exec: null,
			env: null,
			params: null
		};
		const result = await this.resolvePlayer( stream, "default", {
			"default": {
				exec: null,
				args: "bar"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.propEqual( this.playerCacheSetStub.args, [ [ expected ] ], "Sets player cache" );
	});

	test( "Invalid player data - missing data", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", { mpv: {} } ),
			new PlayerError( "Invalid player profile: mpv" ),
			"Throws error on missing player data"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
	});

	test( "Invalid player data - invalid data", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = {
			mpv: {
				exec: {
					linux: null
				}
			}
		};
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", {} ),
			new PlayerError( "Invalid player profile: mpv" ),
			"Throws error on missing player data"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
	});

	test( "Invalid player data - no exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = {
			mpv: {
				exec: {
					linux: null
				}
			}
		};
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", { mpv: { exec: null } } ),
			new PlayerError( "Missing player executable name" ),
			"Throws error on missing player exec conf data or user data"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
		assert.ok( this.logDebugSpy.calledOnceWith( "Resolving player" ), "Calls logDebug" );
	});

	test( "Resolve exec - fail - no custom exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = playerData;
		this.whichFallbackStub.rejects();
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", {
				"mpv": {}
			}),
			new PlayerError( "Couldn't find player executable" ),
			"Throws a PlayerError on unresolvable file"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
		assert.ok( this.logDebugSpy.calledOnceWith( "Resolving player" ), "Calls logDebug" );
		assert.ok( this.whichFallbackStub.calledOnceWithExactly(
			"mpv",
			playerData.mpv.fallback
		), "Calls whichFallback once with correct data" );
	});

	test( "Resolve exec - fail - custom exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = playerData;
		this.whichFallbackStub.rejects();
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", {
				"mpv": {
					exec: "/usr/bin/mpv"
				}
			}),
			new PlayerError( "Couldn't find player executable" ),
			"Throws a PlayerError on unresolvable file"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
		assert.ok( this.logDebugSpy.calledOnceWith( "Resolving player" ), "Calls logDebug" );
		assert.ok( this.whichFallbackStub.calledOnceWithExactly(
			"/usr/bin/mpv",
			playerData.mpv.fallback
		), "Calls whichFallback once with correct data" );
	});

	test( "Resolve exec - success - no custom exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = playerData;
		this.whichFallbackStub.resolves( "/usr/bin/mpv" );

		const expected = {
			exec: "/usr/bin/mpv",
			params: "",
			env: null
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			"mpv": {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.ok( this.playerCacheSetStub.calledOnceWithExactly( result ), "Sets cache" );
		assert.propEqual(
			this.logDebugSpy.getCalls().map( ({ args }) => args ),
			[
				[ "Resolving player", { player: "mpv", playerUserData: {} } ],
				[ "Resolved player", result ]
			],
			"Calls logDebug"
		);
		assert.ok( this.whichFallbackStub.calledOnceWithExactly(
			"mpv",
			playerData.mpv.fallback
		), "Calls whichFallback once with correct data" );
	});

	test( "Resolve exec - success - custom exec", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = playerData;
		this.whichFallbackStub.resolves( "/usr/bin/mpv" );

		const expected = {
			exec: "/usr/bin/mpv",
			params: "",
			env: null
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			"mpv": {
				exec: "/usr/bin/mpv"
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.ok( this.playerCacheSetStub.calledOnceWithExactly( result ), "Sets cache" );
		assert.propEqual(
			this.logDebugSpy.getCalls().map( ({ args }) => args ),
			[
				[ "Resolving player", { player: "mpv", playerUserData: { exec: "/usr/bin/mpv" } } ],
				[ "Resolved player", result ]
			],
			"Calls logDebug"
		);
		assert.ok( this.whichFallbackStub.calledOnceWithExactly(
			"/usr/bin/mpv",
			playerData.mpv.fallback
		), "Calls whichFallback once with correct data" );
	});

	test( "Resolve parameters - fail - no player params", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: null } } );
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", {
				mpv: {}
			}),
			new PlayerError( "Error while generating player parameters" ),
			"Throws a PlayerError on missing player params"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
	});

	test( "Resolve parameters - fail - invalid parameter type", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "foo"
			}
		]} } );
		await assert.rejects(
			this.resolvePlayer( stream, "mpv", {
				mpv: {}
			}),
			new PlayerError( "Error while generating player parameters" ),
			"Throws a PlayerError on invalid or unsupported player parameter"
		);
		assert.ok( this.isAbortedSpy.calledOnceWithExactly( stream ), "Calls isAborted once" );
		assert.ok( this.playerCacheGetStub.calledOnce, "Calls playerCache.get once" );
		assert.notOk( this.playerCacheSetStub.called, "Doesn't call playerCache.set" );
	});

	test( "Resolve parameters - success - no params", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = playerData;
		const expected = {
			exec: null,
			env: null,
			params: ""
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});

	test( "Resolve parameters - success - boolean disabled", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "boolean",
				name: "foo",
				args: "--foo"
			}
		]} } );
		const expected = {
			exec: null,
			env: null,
			params: ""
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {
				foo: false
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});

	test( "Resolve parameters - success - boolean enabled", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "boolean",
				name: "foo",
				args: "--foo"
			}
		]} } );
		const expected = {
			exec: null,
			env: null,
			params: "--foo"
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});

	test( "Resolve parameters - success - custom user params", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "boolean",
				name: "foo",
				args: "--foo"
			}
		]} } );
		const expected = {
			exec: null,
			env: null,
			params: "--bar --baz --foo"
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {
				args: "--bar --baz",
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});

	test( "Resolve parameters - success - platform unset", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "boolean",
				name: "foo",
				args: {
					darwin: "--foo"
				}
			}
		]} } );
		const expected = {
			exec: null,
			env: null,
			params: ""
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});

	test( "Resolve parameters - success - platform set", async function( assert ) {
		/** @this {TestContextServicesStreamingPlayerResolve} */
		const stream = {};
		this.players = merge( {}, playerData, { mpv: { params: [
			{
				type: "boolean",
				name: "foo",
				args: {
					linux: "--foo"
				}
			}
		]} } );
		const expected = {
			exec: null,
			env: null,
			params: "--foo"
		};
		const result = await this.resolvePlayer( stream, "mpv", {
			mpv: {
				foo: true
			}
		});
		assert.propEqual( result, expected, "Returns the correct execObj" );
		assert.ok( this.playerCacheSetStub.calledWithExactly( result ), "Sets player cache" );
	});
});
