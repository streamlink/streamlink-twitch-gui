import Ember from "Ember";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import LanguageFilterMixin from "mixins/LanguageFilterMixin";
import ModelMetadataMixin from "mixins/ModelMetadataMixin";
import toArray from "utils/ember/toArray";
import preload from "utils/preload";


var get = Ember.get;
var set = Ember.set;


export default Ember.Route.extend( InfiniteScrollMixin, LanguageFilterMixin, ModelMetadataMixin, {
	itemSelector: ".stream-item-component",

	modelName: "twitchStream",

	model: function( params ) {
		if ( arguments.length > 0 ) {
			set( this, "game", get( params || {}, "game" ) );
		}

		return get( this, "store" ).query( this.modelName, {
			game                : get( this, "game" ),
			offset              : get( this, "offset" ),
			limit               : get( this, "limit" ),
			broadcaster_language: get( this, "broadcaster_language" )
		})
			.then( toArray )
			.then( preload( "preview.medium_nocache" ) );
	},

	setupController: function( controller ) {
		this._super.apply( this, arguments );

		set( controller, "game", get( this, "game" ) );
	}
});
