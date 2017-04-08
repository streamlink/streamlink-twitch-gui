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

		const store = get( this, "store" );

		store.findAll( "settings" )
			.then( records => records.content.length
				? records.objectAt( 0 )
				: store.createRecord( "settings", { id: 1 } ).save()
			)
			.then( settings => {
				set( this, "content", settings );
			});
	}

}).reopenClass({
	isServiceFactory: true
});
