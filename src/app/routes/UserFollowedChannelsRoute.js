import Ember from "Ember";
import UserIndexRoute from "routes/UserIndexRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import ModelMetadataMixin from "mixins/ModelMetadataMixin";
import toArray from "utils/ember/toArray";
import mapBy from "utils/ember/mapBy";
import preload from "utils/preload";


var get = Ember.get;


export default UserIndexRoute.extend( InfiniteScrollMixin, ModelMetadataMixin, {
	itemSelector: ".channel-item-component",

	queryParams: {
		sortby: {
			refreshModel: true
		},
		direction: {
			refreshModel: true
		}
	},

	modelName: "twitchChannelsFollowed",

	model: function( params ) {
		return get( this, "store" ).query( this.modelName, {
			offset   : get( this, "offset" ),
			limit    : get( this, "limit" ),
			sortby   : params.sortby || "created_at",
			direction: params.direction || "desc"
		})
			.then( toArray )
			.then( mapBy( "channel" ) )
			.then( preload( "logo" ) );
	},

	fetchContent: function() {
		return this.model({
			sortby   : get( this, "controller.sortby" ),
			direction: get( this, "controller.direction" )
		});
	}
});
