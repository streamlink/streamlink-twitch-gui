import Controller from "@ember/controller";
import { set, computed, action } from "@ember/object";
import { later } from "@ember/runloop";
import { inject as service } from "@ember/service";
import { observes } from "@ember-decorators/object";
import { twitch as twitchConfig } from "config";
import RetryTransitionMixin from "ui/routes/-mixins/controllers/retry-transition";


const { oauth: { scope } } = twitchConfig;


export default class UserAuthController extends Controller.extend( RetryTransitionMixin ) {
	/** @type {AuthService} */
	@service auth;
	/** @type {SettingsService} */
	@service settings;

	retryTransition() {
		// use "user.index" as default route
		return super.retryTransition( "user.index" );
	}

	token = "";
	scope = scope.join( ", " );

	/**
	 * 0 000: start
	 * 1 001: auth  - login (server started)
	 * 2 010: auth  - failure
	 * 3 011: auth  - success (not used)
	 * 4 100: token - show form
	 * 5 101: token - login (form submitted)
	 * 6 110: token - failure
	 * 7 111: token - success
	 */
	loginStatus = 0;

	@computed( "loginStatus" )
	get userStatus() {
		return this.loginStatus & 0b011;
	}

	@computed( "userStatus" )
	get hasUserInteraction() {
		return this.userStatus > 0;
	}

	@computed( "loginStatus" )
	get isLoggingIn() {
		return this.loginStatus === 1;
	}

	@computed( "userStatus" )
	get hasLoginResult() {
		return ( this.userStatus & 0b010 ) > 0;
	}

	@computed( "userStatus" )
	get isFailMessageVisible() {
		return this.userStatus === 0b010;
	}

	@computed( "loginStatus" )
	get isTokenFormVisible() {
		return this.loginStatus & 0b100;
	}


	@observes( "auth.server" )
	serverObserver() {
		const authServer = this.auth.server;
		set( this, "loginStatus", authServer ? 1 : 0 );
	}


	resetProperties() {
		set( this, "token", "" );
		set( this, "loginStatus", 0 );
	}


	@action
	showTokenForm() {
		set( this, "loginStatus", 4 );
	}

	// login via user and password
	@action
	async signin() {
		if ( this.isLoggingIn ) { return; }
		set( this, "loginStatus", 1 );

		try {
			await this.auth.signin();
			set( this, "loginStatus", 3 );
			this.retryTransition();

		} catch ( e ) {
			set( this, "loginStatus", 2 );
			await new Promise( r => later( r, 3000 ) );
			set( this, "loginStatus", 0 );
		}
	}

	// login via access token
	@action
	async signinToken( success, failure ) {
		if ( this.isLoggingIn ) { return; }
		set( this, "loginStatus", 5 );

		const token = this.token;

		// show the loading icon for a sec and wait
		await new Promise( r => later( r, 1000 ) );

		let successful = false;
		try {
			// login attempt
			await this.auth.login( token, false );

			// visualize result: update button and icon
			set( this, "loginStatus", 7 );
			await new Promise( r => later( r, 1000 ) );
			await success();
			successful = true;

		} catch ( e ) {
			set( this, "loginStatus", 6 );
			await new Promise( r => later( r, 3000 ) );
			await failure();

		} finally {
			set( this, "loginStatus", 4 );
			// retry transition on success
			if ( successful ) {
				this.retryTransition();
			}
		}
	}

	// abort sign in with username + password
	@action
	abort() {
		this.auth.abortSignin();
	}
}
