import Controller from "@ember/controller";
import { get, computed } from "@ember/object";


const reFilter = /^\w+$/;


export default Controller.extend({
	filter: "",

	modelFiltered: computed( "model.[]", "all", "filter", function() {
		const filter = get( this, "filter" ).toLowerCase();
		if ( !reFilter.test( filter ) ) {
			return get( this, "model" );
		}

		return get( this, "all" ).filter(function( item ) {
			return get( item, "settings.id" ).toLowerCase().indexOf( filter ) !== -1;
		});
	}),


	actions: {
		erase( modelItem ) {
			const model = get( this, "model" );
			const settingsRecord = get( modelItem, "settings" );
			if ( get( settingsRecord, "isDeleted" ) ) { return; }

			settingsRecord.destroyRecord()
				.then(function() {
					model.removeObject( modelItem );
				});
		}
	}
});
