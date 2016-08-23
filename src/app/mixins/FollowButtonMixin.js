import {
	get,
	set,
	Mixin
} from "Ember";
import TwitchInteractButtonMixin from "mixins/TwitchInteractButtonMixin";


export default Mixin.create( TwitchInteractButtonMixin, {
	action: "follow",

	iconLoading : "fa-question",
	iconSuccess : "fa-heart",
	iconFailure : "fa-heart-o",
	titleLoading: "",
	titleSuccess: function() {
		var name = get( this, "name" );
		return `Unfollow ${name}`;
	}.property( "name" ),
	titleFailure: function() {
		var name = get( this, "name" );
		return `Follow ${name}`;
	}.property( "name" ),


	actions: {
		follow( success, failure ) {
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
					.then( success, failure )
					.then( unlock, unlock );

			} else {
				// delete the record and save it
				record.destroyRecord()
					.then(function() {
						set( self, "record", false );
						// also unload it
						store.unloadRecord( record );
					})
					.then( success, failure )
					.then( unlock, unlock );
			}
		}
	}
});
