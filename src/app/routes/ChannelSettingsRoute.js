define([
	"Ember",
	"utils/ember/ObjectBuffer"
], function(
	Ember,
	ObjectBuffer
) {

	var get = Ember.get;


	return Ember.Route.extend({
		modal: Ember.inject.service(),

		model: function() {
			var store  = get( this, "store" );
			var params = this.paramsFor( "channel" );
			var id     = params.channel;

			return store.findRecord( "channelSettings", id )
				.catch(function() {
					// get the record automatically created by store.findRecord()
					var record = store.recordForId( "channelSettings", id );
					// transition from `root.empty` to `root.loaded.created.uncommitted`
					record._internalModel.loadedData();
					return record;
				})
				.then(function( record ) {
					// use a buffer proxy object as model
					return {
						model : record,
						buffer: ObjectBuffer.create({
							content: record.toJSON()
						})
					};
				});
		},

		refresh: function() {
			return this.container.lookup( "route:channel" ).refresh();
		},

		actions: {
			willTransition: function( transition ) {
				// check whether the user has changed any values
				if ( !get( this, "controller.model.buffer.isDirty" ) ) {
					// don't keep the channelSettings records in cache
					return get( this, "store" ).unloadAll( "channelSettings" );
				}

				// stay here...
				transition.abort();

				// and let the user decide
				get( this, "modal" ).openModal( "confirm", this.controller, {
					previousTransition: transition
				});
			}
		}
	});

});
