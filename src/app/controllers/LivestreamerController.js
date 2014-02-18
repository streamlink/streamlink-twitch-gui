define( [ "ember" ], function( Ember ) {

	return Ember.ObjectController.extend({
		needs: "modal",

		parameters: [
			{
				arg		: "--player",
				params	: [ "player" ],
				cond	: [ "player" ]
			},
			{
				arg		: "--player-args",
				params	: [ "player_params" ],
				cond	: [ "player", "player_params" ]
			},
			{
				arg		: "--player-continuous-http",
				params	: [],
				cond	: [ "player_reconnect" ]
			},
			{
				arg		: "--player-no-close",
				params	: [],
				cond	: [ "player_no_close" ]
			}
		],

		actions: {
			start: function( settings, stream ) {
				var	path = settings.get( "livestreamer" ),
					qualities = settings.get( "qualities" ),
					quality = settings.get( "quality" ),
					args = [];

				// Prepare parameters
				this.parameters.forEach(function( elem ) {
					if ( elem.cond.every(function( cond ) {
						return !!settings.get( cond );
					}) ) {
						[].push.apply( args, [ elem.arg ].concat(
							elem.params.map(function( param ) {
								return settings.get( param );
							}) )
						);
					}
				});

				args = args.concat([
					stream.channel.url,
					qualities.hasOwnProperty( quality )
						? qualities[ quality ].quality
						: qualities[ 0 ].quality
				]);

				// Dialog
				var	modal = this.get( "controllers.modal" );
				this.send( "openModal",
					"Watching now: " + stream.channel.name,
					stream.channel.status,
					[
						new modal.Button( "Close", "btn-danger", "fa-times", kill )
					]
				);

				// Child process
				var	livestreamer = require( "child_process" ).spawn(
						path.length ? path : "livestreamer",
						args
					);
				livestreamer.on( "exit", function() {
					this.send( "closeModal" );
				}.bind( this ) );

				function kill() {
					livestreamer && livestreamer.kill( "SIGTERM" );
				}
			}
		}
	});

});
