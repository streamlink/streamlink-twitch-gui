import Controller from "@ember/controller";
import { get, set, computed, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { twitch } from "config";
import RetryTransitionMixin from "ui/routes/-mixins/controllers/retry-transition";
import wait from "utils/wait";


const { oauth: { scope } } = twitch;


export default Controller.extend( RetryTransitionMixin, {
	auth: service(),
	settings: service(),

	retryTransition() {
		// use "user.index" as default route
		return this._super( "user.index" );
	},

	token: "",

	scope: scope.join( ", " ),

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
	loginStatus: 0,

	userStatus: computed( "loginStatus", function() {
		return get( this, "loginStatus" ) & 3;
	}),

	hasUserInteraction: computed( "userStatus", function() {
		return get( this, "userStatus" ) > 0;
	}),

	isLoggingIn: computed( "loginStatus", function() {
		return get( this, "loginStatus" ) === 1;
	}),

	hasLoginResult: computed( "userStatus", function() {
		const userStatus = get( this, "userStatus" );
		return ( userStatus & 2 ) > 0;
	}),

	showFailMessage: computed( "userStatus", function() {
		return get( this, "userStatus" ) === 2;
	}),

	showTokenForm: computed( "loginStatus", function() {
		return get( this, "loginStatus" ) & 4;
	}),


	serverObserver: observer( "auth.server", function() {
		const authServer = get( this, "auth.server" );
		set( this, "loginStatus", authServer ? 1 : 0 );
	}),


	resetProperties() {
		set( this, "token", "" );
		set( this, "loginStatus", 0 );
	},


	actions: {
		showTokenForm() {
			set( this, "loginStatus", 4 );
		},

		// login via user and password
		signin() {
			if ( get( this, "isLoggingIn" ) ) { return; }
			set( this, "loginStatus", 1 );

			const auth = get( this, "auth" );

			auth.signin()
				.then( () => {
					set( this, "loginStatus", 3 );
					this.retryTransition();
				})
				.catch( () => {
					set( this, "loginStatus", 2 );
					wait( 3000 )()
						.then( () => {
							set( this, "loginStatus", 0 );
						});
				});
		},

		// login via access token
		signinToken( success, failure ) {
			if ( get( this, "isLoggingIn" ) ) { return; }
			set( this, "loginStatus", 5 );

			const token = get( this, "token" );
			const auth = get( this, "auth" );

			// show the loading icon for a sec and wait
			wait( 1000 )()
				// login attempt
				.then( () => auth.login( token, false ) )
				// visualize result: update button and icon
				.then( () => {
					set( this, "loginStatus", 7 );
					return wait( 1000 )( true )
						.then( success );
				}, () => {
					set( this, "loginStatus", 6 );
					return wait( 3000 )( false )
						.then( failure )
						.catch( data => data );
				})
				// retry transition on success
				.then( result => {
					set( this, "loginStatus", 4 );
					if ( result ) {
						this.retryTransition();
					}
				});
		},

		// abort sign in with username + password
		abort() {
			get( this, "auth" ).abortSignin();
		}
	}
});
