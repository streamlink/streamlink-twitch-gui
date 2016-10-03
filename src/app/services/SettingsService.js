import {
	get,
	set,
	inject,
	ObjectProxy
} from "Ember";


const { service } = inject;


// A service object is just a regular object, so we can use an ObjectProxy as well
export default ObjectProxy.extend({
	store: service(),

	content: null,

	init() {
		this._super( ...arguments );

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

}).reopenClass({
	isServiceFactory: true
});
