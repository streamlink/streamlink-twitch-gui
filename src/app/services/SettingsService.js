import {
	get,
	set,
	inject,
	Evented,
	ObjectProxy
} from "ember";


const { service } = inject;


// A service object is just a regular object, so we can use an ObjectProxy as well
export default ObjectProxy.extend( Evented, {
	store: service(),

	content: null,

	init() {
		const store = get( this, "store" );
		// don't use async functions here and use Ember RSVP promises instead
		store.findOrCreateRecord( "settings" )
			.then( settings => {
				set( this, "content", settings );
				settings.on( "didUpdate", ( ...args ) => this.trigger( "didUpdate", ...args ) );
				this.trigger( "initialized" );
			});
	}

}).reopenClass({
	isServiceFactory: true
});
