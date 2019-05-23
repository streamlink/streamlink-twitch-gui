import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { setupStore, adapterRequest } from "store-utils";
import sinon from "sinon";

import Service from "@ember/service";
import Adapter from "ember-data/adapter";
import { on } from "@ember-decorators/object";
import { EventEmitter } from "events";
import { Stream, Writable } from "stream";

import authServiceInjector from "inject-loader?utils/node/http/HttpServer!services/auth/service";
import httpServerInjector from "inject-loader?http!utils/node/http/HttpServer";
import ModelFragmentsInitializer from "init/initializers/model-fragments";
import Auth from "data/models/auth/model";
import TwitchAdapter from "data/models/twitch/adapter";
import TwitchRoot from "data/models/twitch/root/model";
import TwitchRootSerializer from "data/models/twitch/root/serializer";
import TwitchRootFixtures from "fixtures/data/models/twitch/root.json";
import { twitch as twitchConfig } from "config";


module( "services/auth", function( hooks ) {
	const fakeToken = "abcdefghijklmnopqrst0123456789";
	const {
		oauth: {
			"client-id": expectedClientId,
			"scope": expectedScopes
		}
	} = twitchConfig;

	class FakeInternalHttpServer extends EventEmitter {
		setTimeout() {}

		listen( _, callback ) {
			callback();
		}
	}

	class FakeIncomingMessage extends Stream {
		constructor( method, url ) {
			super();
			this.method = method;
			this.url = url;
		}
	}

	class FakeServerResponse extends Writable {
		content = "";
		statusCode = 200;

		_write( chunk, encoding, callback ) {
			this.content += chunk.toString();
			callback();
		}

		_final( callback ) {
			callback();
		}
	}


	setupTest( hooks, {
		resolver: buildResolver({
			Auth,
			TwitchRoot,
			TwitchRootSerializer
		})
	});

	hooks.beforeEach(function( assert ) {
		const context = this;

		setupStore( this.owner );
		ModelFragmentsInitializer.initialize( this.owner );

		// NwjsService
		this.openBrowserStub = sinon.stub();
		this.focusSpy = sinon.spy();
		this.owner.register( "service:nwjs", class extends Service {
			openBrowser = context.openBrowserStub;
			focus = context.focusSpy;
		});

		// Models, Adapters, etc
		this.kTwitchRootFixtures = "valid";
		this.setAccessTokenSpy = sinon.spy();
		this.sessionFindAllStub = sinon.stub().resolves( [] );
		this.sessionCreateStub = sinon.stub().resolves();
		this.sessionSaveStub = sinon.stub().resolves();
		this.owner.register( "adapter:auth", class extends Adapter {
			findAll = context.sessionFindAllStub;
			createRecord = context.sessionCreateStub;
			updateRecord = context.sessionSaveStub;
		});
		this.owner.register( "adapter:twitch", class extends TwitchAdapter {
			static set access_token( value ) {
				context.setAccessTokenSpy.call( this, value );
			}
		});
		this.owner.register( "adapter:twitch-root", class extends TwitchAdapter {
			async ajax( ...args ) {
				return adapterRequest(
					assert,
					TwitchRootFixtures[ context.kTwitchRootFixtures ],
					...args
				);
			}
		});

		// HttpServer
		this.fakeHttpServer = null;
		const { default: InjectedHttpServer } = httpServerInjector({
			"http": {
				createServer: () => new FakeInternalHttpServer()
			}
		});
		this.httpServerCloseSpy = sinon.spy();
		class FakeHttpServer extends InjectedHttpServer {
			close = context.httpServerCloseSpy;
		}
		this.httpServerStub = sinon.stub()
			.callsFake( ( ...args ) => ( this.fakeHttpServer = new FakeHttpServer( ...args ) ) );
		this.httpServerEmitRequest = async ( method, url ) => {
			const req = new FakeIncomingMessage( method, url );
			const res = new FakeServerResponse();
			await context.fakeHttpServer.handleRequest( req, res );
			await new Promise( resolve => process.nextTick( resolve ) );

			return res;
		};

		// AuthService
		this.onLoginSpy = sinon.spy();
		this.onInitializedSpy = sinon.spy();
		const { default: AuthService } = authServiceInjector({
			"utils/node/http/HttpServer": context.httpServerStub
		});
		this.owner.register( "service:auth", class extends AuthService {
			@on( "login" )
			_onLogin( ...args ) {
				context.onLoginSpy.call( this, ...args );
			}
			@on( "initialized" )
			_onInitialized( ...args ) {
				context.onInitializedSpy.call( this, ...args );
			}
		} );
	});


	test( "Log in - invalid", async function( assert ) {
		this.kTwitchRootFixtures = "invalid";

		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );
		await AuthService._loadSession();

		assert.notOk( AuthService.session.isPending, "Session is not pending initially" );
		assert.notOk( this.onLoginSpy.called, "Login event hasn't triggered yet" );

		const promise = AuthService.login( fakeToken );

		assert.ok( AuthService.session.isPending, "Login is pending" );
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( fakeToken ), "Updates adapter" );
		this.setAccessTokenSpy.resetHistory();

		await assert.rejects(
			promise,
			new Error( "Invalid session" ),
			"Rejects on invalid session"
		);

		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( null ), "Resets adapter" );
		assert.ok( this.onLoginSpy.calledOnceWithExactly( false ), "Triggers failed login event" );
		assert.notOk( AuthService.session.isPending, "Login is not pending anymore" );
		assert.notOk( AuthService.session.isLoggedIn, "User is not logged in" );
	});

	test( "Log in - missing scopes", async function( assert ) {
		this.kTwitchRootFixtures = "missing-scopes";

		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );
		await AuthService._loadSession();

		assert.notOk( AuthService.session.isPending, "Session is not pending initially" );
		assert.notOk( this.onLoginSpy.called, "Login event hasn't triggered yet" );

		const promise = AuthService.login( fakeToken );

		assert.ok( AuthService.session.isPending, "Login is pending" );
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( fakeToken ), "Updates adapter" );
		this.setAccessTokenSpy.resetHistory();

		await assert.rejects(
			promise,
			new Error( "Invalid session" ),
			"Rejects on invalid session"
		);

		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( null ), "Resets adapter" );
		assert.ok( this.onLoginSpy.calledOnceWithExactly( false ), "Triggers failed login event" );
		assert.notOk( AuthService.session.isPending, "Login is not pending anymore" );
		assert.notOk( AuthService.session.isLoggedIn, "User is not logged in" );
	});

	test( "Log in - success", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );
		await AuthService._loadSession();

		assert.notOk( AuthService.session.isPending, "Session is not pending initially" );
		assert.notOk( this.onLoginSpy.called, "Login event hasn't triggered yet" );

		const promise = AuthService.login( fakeToken );

		assert.ok( AuthService.session.isPending, "Login is pending" );
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( fakeToken ), "Updates adapter" );

		await promise;

		assert.strictEqual( AuthService.session.access_token, fakeToken, "Updates session token" );
		assert.strictEqual( AuthService.session.user_id, 1337, "Updates user id" );
		assert.strictEqual( AuthService.session.user_name, "user", "Updates user name" );
		assert.ok( this.sessionSaveStub.calledOnce, "Saves session on success" );
		assert.ok( this.setAccessTokenSpy.calledOnce, "Doesn't reset adapter" );
		assert.ok( this.onLoginSpy.calledOnceWithExactly( true ), "Triggers login event" );
		assert.notOk( AuthService.session.isPending, "Login is not pending anymore" );
		assert.ok( AuthService.session.isLoggedIn, "User is now logged in" );
	});

	test( "Log in - auto - non-existing user", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		await AuthService.autoLogin();

		assert.ok( this.onInitializedSpy.called, "Initialized event has been triggered" );
		assert.notOk( this.onLoginSpy.called, "Login event hasn't been triggered" );
		assert.notOk( AuthService.session.isPending, "Login is not pending" );
	});

	test( "Log in - auto - existing user", async function( assert ) {
		this.sessionFindAllStub.resolves([
			{
				id: "1",
				access_token: fakeToken,
				scope: "user_read+user_blocks_read+user_blocks_edit+user_follows_edit"
					+ "+user_subscriptions+chat_login",
				date: "2000-01-01T00:00:00Z"
			}
		]);

		const _loadSessionSpy = sinon.spy(
			this.owner.factoryFor( "service:auth" ).class.prototype,
			"_loadSession"
		);

		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		const promise = AuthService.autoLogin();
		// wait for _loadSession to resolve
		await _loadSessionSpy.returnValues[0];

		assert.ok( this.onInitializedSpy.called, "Initialized event has been triggered" );
		assert.notOk( this.onLoginSpy.called, "Login event hasn't been triggered yet" );
		assert.ok( AuthService.session.isPending, "Login is pending" );
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( fakeToken ), "Updates adapter" );

		await promise;

		assert.strictEqual( AuthService.session.access_token, fakeToken, "Updates session token" );
		assert.strictEqual( AuthService.session.user_id, 1337, "Updates user id" );
		assert.strictEqual( AuthService.session.user_name, "user", "Updates user name" );
		assert.notOk( this.sessionSaveStub.called, "Doesn't save session on auto login success" );
		assert.ok( this.setAccessTokenSpy.calledOnce, "Doesn't reset adapter" );
		assert.ok( this.onLoginSpy.calledOnceWithExactly( true ), "Triggers login event" );
		assert.notOk( AuthService.session.isPending, "Login is not pending anymore" );
		assert.ok( AuthService.session.isLoggedIn, "User is now logged in" );
	});

	test( "Sign in - already running", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		AuthService.server = {};

		await assert.rejects(
			AuthService.signin(),
			new Error( "An OAuth response server is already running" ),
			"Rejects if auth server is already running"
		);
		assert.ok( AuthService.server, "HttpServer is still referenced" );
	});

	test( "Sign in - openBrowser fail", async function( assert ) {
		this.openBrowserStub.throws( new Error( "fail" ) );

		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference" );

		const promise = AuthService.signin();

		assert.ok(
			this.httpServerStub.calledBefore( this.openBrowserStub ),
			"Creates server before opening browser"
		);
		await assert.rejects(
			promise,
			new Error( "fail" ),
			"Rejects if openBrowser fails"
		);
		assert.ok( this.httpServerCloseSpy.called, "Shuts down HttpServer when done" );
		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference anymore" );
		assert.ok( this.focusSpy.calledOnceWithExactly( true ), "Focuses app window when done" );
	});

	test( "Sign in - invalid query params", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference" );

		const promise = AuthService.signin();

		assert.ok(
			this.httpServerStub.calledWithNew(),
			"Creates a new HttpServer instance when signing in"
		);
		assert.ok(
			this.httpServerStub.calledOnceWithExactly( 65432, 1000 ),
			"Sets server port and timeout"
		);
		assert.ok( AuthService.server, "Has an HttpServer reference" );
		assert.ok( this.openBrowserStub.calledOnce, "Opens browser when signing in" );

		const res = await this.httpServerEmitRequest( "GET", "http://localhost:65432/token" );
		assert.ok(
			res.content.includes( "OAuth token validation error" ),
			"Writes error message"
		);
		assert.strictEqual( res.statusCode, 500, "Sends a 500 HTTP status code on error" );
		assert.notOk( res.writable, "Writable stream has finished" );

		await assert.rejects(
			promise,
			new Error( "OAuth token validation error" ),
			"Rejects with error"
		);

		assert.ok( this.httpServerCloseSpy.called, "Shuts down HttpServer when done" );
		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference anymore" );
		assert.ok( this.focusSpy.calledOnceWithExactly( true ), "Focuses app window when done" );
	});

	test( "Sign in - success", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );
		await AuthService._loadSession();

		assert.ok( AuthService.session, "Has a session record" );
		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference" );

		const promise = AuthService.signin();

		assert.ok(
			this.httpServerStub.calledWithNew(),
			"Creates a new HttpServer instance when signing in"
		);
		assert.ok(
			this.httpServerStub.calledOnceWithExactly( 65432, 1000 ),
			"Sets server port and timeout"
		);
		assert.ok( AuthService.server, "Has an HttpServer reference" );
		assert.ok(
			this.openBrowserStub.calledOnceWithExactly([
				"https://id.twitch.tv/oauth2/authorize",
				"?response_type=token",
				`&client_id=${expectedClientId}`,
				"&redirect_uri=http%3A%2F%2Flocalhost%3A65432%2Fredirect",
				`&scope=${expectedScopes.join( "+" )}`,
				"&force_verify=true"
			].join( "" ) ),
			"Opens browser with correct OAuth URL when signing in"
		);

		const resRedirect = await this.httpServerEmitRequest(
			"GET",
			"http://localhost:65432/redirect"
		);
		assert.ok(
			resRedirect.content.includes( "<title>Authentication</title>" ),
			"Writes redirect page content"
		);
		assert.notOk( resRedirect.writable, "Writable stream has finished" );

		const scope = expectedScopes.join( "+" );
		const resToken = await this.httpServerEmitRequest(
			"GET",
			`http://localhost:65432/token?access_token=${fakeToken}&scope=${scope}`
		);
		assert.ok( resToken.content.includes( "OK" ), "Writes success message" );
		assert.notOk( resToken.writable, "Writable stream has finished" );

		await promise;

		assert.ok( this.httpServerCloseSpy.called, "Shuts down HttpServer when done" );
		assert.notOk( AuthService.server, "Doesn't have an HttpServer reference anymore" );
		assert.ok( this.focusSpy.calledOnceWithExactly( true ), "Focuses app window when done" );
	});

	test( "Sign in - abort without server", async function( assert ) {
		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		assert.notOk( AuthService.server, "Doesn't reference an HttpServer instance" );
		AuthService.abortSignin();
		assert.notOk( this.httpServerCloseSpy.called, "Doesn't try to close non-existing server" );
	});

	test( "Sign out", async function( assert ) {
		this.sessionFindAllStub.resolves([
			{
				id: "1",
				access_token: fakeToken,
				scope: "user_read+user_blocks_read+user_blocks_edit+user_follows_edit"
					+ "+user_subscriptions+chat_login",
				date: "2000-01-01T00:00:00Z"
			}
		]);

		/** @type {AuthService} */
		const AuthService = this.owner.lookup( "service:auth" );

		await AuthService.autoLogin();

		assert.strictEqual( AuthService.session.access_token, fakeToken, "Has session token" );
		assert.ok( AuthService.session.scope, "Has session scope" );
		assert.ok( AuthService.session.date, "Has session date" );
		assert.strictEqual( AuthService.session.user_id, 1337, "Has user id" );
		assert.strictEqual( AuthService.session.user_name, "user", "Has user name" );
		assert.ok( AuthService.session.isLoggedIn, "Is logged in" );
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( fakeToken ), "Sets token" );

		this.setAccessTokenSpy.resetHistory();

		await AuthService.signout();
		assert.ok( this.setAccessTokenSpy.calledOnceWithExactly( null ), "Clears token" );
		assert.notOk( AuthService.session.access_token, "Doesn't have token anymore" );
		assert.notOk( AuthService.session.scope, "Doesn't have session scope anymore" );
		assert.notOk( AuthService.session.date, "Doesn't have session date anymore" );
		assert.notOk( AuthService.session.user_id, "Doesn't have user id anymore" );
		assert.notOk( AuthService.session.user_name, "Doesn't have user name anymore" );
		assert.notOk( AuthService.session.isLoggedIn, "Is not logged in anymore" );
		assert.ok( this.sessionSaveStub.calledOnce, "Saves empty session data" );
	});
});
