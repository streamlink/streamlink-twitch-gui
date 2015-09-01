define([
	"Ember",
	"mixins/TwitchInteractButtonMixin"
], function(
	Ember,
	TwitchInteractButtonMixin
) {

	var get = Ember.get;
	var set = Ember.set;

	return Ember.Mixin.create( TwitchInteractButtonMixin, {
		action: "follow",

		iconLoading : "fa-question",
		iconSuccess : "fa-heart",
		iconFailure : "fa-heart-o",
		titleLoading: "",
		titleSuccess: function() {
			var name = get( this, "name" );
			return "Unfollow %@".fmt( name );
		}.property( "name" ),
		titleFailure: function() {
			var name = get( this, "name" );
			return "Follow %@".fmt( name );
		}.property( "name" ),


		actions: {
			"follow": function( callback ) {
				if ( !this.modelName ) { return; }
				if ( !get( this, "isValid" ) || get( this, "isLocked" ) ) { return; }
				set( this, "isLocked", true );

				var self   = this;
				var store  = get( this, "store" );
				var model  = get( this, "id" );
				var record = get( this, "record" );

				function unlock() { set( self, "isLocked", false ); }

				if ( !record ) {
					// create a new record and save it
					record = store.createRecord( this.modelName, { id: model } );
					record.save()
						.then(function( record ) {
							set( self, "record", record );
						})
						.then( callback )
						.then( unlock, unlock );

				} else {
					// delete the record and save it
					record.destroyRecord()
						.then(function() {
							set( self, "record", false );
							// also unload it
							store.unloadRecord( record );
						})
						.then( callback )
						.then( unlock, unlock );
				}
			}
		}
	});

});
