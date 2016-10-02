import {
	get,
	set,
	computed,
	EmberObject
} from "Ember";
import { PromiseObject } from "EmberData";
import SettingsSubmenuRoute from "routes/SettingsSubmenuRoute";
import InfiniteScrollMixin from "mixins/InfiniteScrollMixin";
import preload from "utils/preload";


export default SettingsSubmenuRoute.extend( InfiniteScrollMixin, {
	controllerName: "settingsChannels",
	itemSelector: ".settings-channel-item-component",

	all: null,


	model() {
		var store = get( this, "store" );

		return store.findAll( "channelSettings" )
			.then(function( recordsArray ) {
				// we need all channelSettings records, so we can search for specific ones
				// that have not been added to the controller's model yet
				this.all = recordsArray.map(function( record ) {
					// return both channelSettings and twitchChannel records
					return EmberObject.extend({
						settings: record,
						// load the twitchChannel record on demand (PromiseObject)
						// will be triggered by the first property read-access
						channel: computed(function() {
							var id = get( record, "id" );
							return PromiseObject.create({
								promise: store.find( "twitchChannel", id )
									.then( preload( "logo" ) )
							});
						})
					}).create();
				});
			}.bind( this ) )
			.then( this.fetchContent.bind( this ) );
	},

	fetchContent() {
		var limit  = get( this, "limit" );
		var offset = get( this, "offset" );

		return Promise.resolve(
			this.all.slice( offset, offset + limit )
		);
	},

	setupController( controller ) {
		set( controller, "all", this.all );
		this._super.apply( this, arguments );
	},

	deactivate() {
		this._super.apply( this, arguments );
		this.all = null;
	}
});
