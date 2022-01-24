import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { run } from "@ember/runloop";


const reFilter = /^\w+$/;


export default Controller.extend({
	filter: "",

	modelFiltered: computed( "model.[]", "all", "filter", function() {
		const filter = this.filter.toLowerCase();
		if ( !reFilter.test( filter ) ) {
			return this.model;
		}

		return this.all.filter( item => item.settings.id
			.toLowerCase()
			.indexOf( filter ) !== -1
		);
	}),


	actions: {
		erase( modelItem ) {
			const { settings: settingsRecord } = modelItem;
			if ( settingsRecord.isDeleted ) { return; }

			const { model } = this;
			run( () => settingsRecord.destroyRecord() )
				.then( () => {
					model.removeObject( modelItem );
				});
		}
	}
});
