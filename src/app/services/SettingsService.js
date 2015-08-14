define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var set = Ember.set;

	// A service object is just a regular object, so we can use an ObjectProxy as well
	return Ember.ObjectProxy.extend({
		store: Ember.inject.service(),

		content: null,

		init: function() {
			this._super.apply( this, arguments );

			var store = get( this, "store" );

			store.findAll( "settings" )
				.then(function( records ) {
					return records.content.length
						? records.objectAt( 0 )
						: store.createRecord( "settings", { id: 1 } ).save();
				})
				.then(function( settings ) {
					set( this, "content", settings );
				}.bind( this ) );
		}
	});

});
