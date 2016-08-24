import Ember from "Ember";


var get = Ember.get;
var set = Ember.set;
var merge = Ember.merge;


export default Ember.Mixin.create({
	store: Ember.inject.service(),

	modelName: null,

	actions: {
		didTransition: function() {
			var modelName = get( this, "modelName" );
			if ( !modelName ) { return; }

			var store      = get( this, "store" );
			var controller = get( this, "controller" );
			var metadata   = store._metadataFor( modelName );

			set( controller, "metadata", merge( {}, metadata ) );
		}
	}
});
