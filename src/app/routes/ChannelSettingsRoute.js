define( [ "ember", "utils/ember/ObjectBuffer" ], function( Ember, ObjectBuffer ) {

	var get = Ember.get;

	return Ember.Route.extend({
		model: function() {
			var store  = this.store;
			var params = this.paramsFor( "channel" );
			var id     = params.channel;

			return store.find( "channelSettings", id )
				.catch(function() {
					// get the record automatically created by store.find()
					var record = store.recordForId( "channelSettings", id );
					// transition from `root.empty` to `root.loaded.created.uncommitted`
					record.loadedData();
					return record;
				})
				.then(function( record ) {
					// use a buffer proxy object as model
					return ObjectBuffer.create({
						content: record
					});
				});
		},

		actions: {
			willTransition: function( transition ) {
				var model = get( this, "controller.model" );
				if ( get( model, "hasBufferedChanges" ) ) {
					transition.abort();

					this.send( "openModal", "settingsModal", this.controller, {
						modalHead : "Please confirm",
						modalBody : "Do you want to apply your changes?",
						previousTransition: transition
					});

				} else {
					// prevent pollution:
					// destroy all records that don't have custom values set
					var isEmpty = true;
					model = get( model, "content" );
					model.eachAttribute(function( attr, meta ) {
						if ( get( model, attr ) !== meta.options.defaultValue ) {
							isEmpty = false;
						}
					});
					if ( isEmpty ) {
						model.destroyRecord();
					}
				}
			}
		}
	});

});
