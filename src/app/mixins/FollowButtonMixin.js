import {
	get,
	set,
	computed,
	Mixin
} from "Ember";
import TwitchInteractButtonMixin from "mixins/TwitchInteractButtonMixin";


export default Mixin.create( TwitchInteractButtonMixin, {
	iconLoading : "fa-question",
	iconSuccess : "fa-heart",
	iconFailure : "fa-heart-o",
	titleLoading: "",
	titleSuccess: computed( "name", function() {
		let name = get( this, "name" );
		return `Unfollow ${name}`;
	}),
	titleFailure: computed( "name", function() {
		let name = get( this, "name" );
		return `Follow ${name}`;
	}),

	isLocked: false,


	action( success, failure ) {
		const modelName = this.modelName;
		if ( !modelName ) { return; }
		if ( !get( this, "isValid" ) || get( this, "isLocked" ) ) { return; }
		set( this, "isLocked", true );

		const store = get( this, "store" );
		const id = get( this, "id" );
		const record = get( this, "record" );

		let promise;

		if ( !record ) {
			// create a new record and save it
			promise = store.createRecord( modelName, { id } )
				.save()
				.then( record => set( this, "record", record ) );

		} else {
			// delete the record and save it
			promise = record.destroyRecord()
				.then( () => {
					set( this, "record", false );
					// also unload it
					store.unloadRecord( record );
				});
		}

		promise
			.then( success, failure )
			.finally( () => set( this, "isLocked", false ) );
	}
});
