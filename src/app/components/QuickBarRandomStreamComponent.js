define([
	"Ember",
	"components/FormButtonComponent",
	"mixins/LanguageFilterMixin"
], function(
	Ember,
	FormButtonComponent,
	LanguageFilterMixin
) {

	var get = Ember.get;
	var set = Ember.set;

	return FormButtonComponent.extend( LanguageFilterMixin, {
		metadata: Ember.inject.service(),
		store   : Ember.inject.service(),

		"class": "btn-info",

		title: "Launch random stream",

		icon    : "fa-random",
		iconanim: true,
		spinner : true,

		game: null,
		followedStreams: false,

		action: "randomStream",
		openLivestreamer: "openLivestreamer",

		lock: false,

		model: function() {
			return get( this, "followedStreams" )
				? "twitchStreamsFollowed"
				: "twitchStream";
		}.property( "followedStreams" ),


		actions: {
			"randomStream": function( success, failure ) {
				if ( get( this, "lock" ) ) { return; }
				set( this, "lock", true );

				var self  = this;
				var model = get( self, "model" );
				var store = get( self, "store" );
				var max   = get( self, "metadata.config.random-max" ) || 100;
				var game  = get( self, "game" );

				var query = {
					// [0, max)
					offset              : Math.floor( Math.random() * max ),
					limit               : 1,
					broadcaster_language: get( self, "broadcaster_language" )
				};

				if ( game ) {
					query.game = game;
				}

				store.query( model, query )
					.then(function( streams ) {
						// did we find a stream?
						var stream = streams.objectAt( 0 );
						if ( stream ) { return stream; }

						// if not, get number of streams in total
						var total = store._metadataFor( model ).total;
						if ( !total ) { return Promise.reject(); }

						// decrease offset and query again [0, total)
						query.offset = Math.floor( Math.random() * total );
						return store.query( model, query )
							.then(function( streams ) {
								return streams.objectAt( 0 );
							});
					})
					.then(function( stream ) {
						if ( !stream ) { throw new Error(); }

						if ( get( self, "followedStreams" ) ) {
							stream = get( stream, "stream" );
						}

						self.sendAction( "openLivestreamer", stream );
						success();
					})
					.catch(function(){
						failure();
					})
					.then(function() {
						set( self, "lock", false );
					});
			}
		}
	});

});
