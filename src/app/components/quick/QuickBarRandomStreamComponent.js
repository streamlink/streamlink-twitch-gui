import {
	get,
	set,
	merge,
	inject
} from "Ember";
import { vars } from "config";
import FormButtonComponent from "components/button/FormButtonComponent";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";


const { service } = inject;
const { "random-max": randomMax } = vars;


export default FormButtonComponent.extend( LanguageFilterMixin, {
	livestreamer: service(),
	store: service(),

	"class": "btn-info",

	title: "Launch random stream",

	icon    : "fa-random",
	iconanim: true,
	spinner : true,

	model: "twitchStream",
	query: null,

	action: "randomStream",

	lock: false,


	actions: {
		"randomStream": function( success, failure ) {
			if ( get( this, "lock" ) ) { return; }
			set( this, "lock", true );

			var self  = this;
			var model = get( self, "model" );
			var store = get( self, "store" );

			var query = {
				// [0, max)
				offset              : Math.floor( Math.random() * randomMax ),
				limit               : 1,
				broadcaster_language: get( self, "broadcaster_language" )
			};

			var _query = get( self, "query" );
			if ( _query ) {
				query = merge( _query, query );
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

					if ( model === "twitchStreamsFollowed" ) {
						return get( stream, "stream" );
					} else if ( model === "twitchStreamsHosted" ) {
						return get( stream, "target" );
					} else {
						return stream;
					}
				})
				.then(function( stream ) {
					get( self, "livestreamer" ).startStream( stream );
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
