import Controller from "@ember/controller";
import { computed, action } from "@ember/object";
import { run } from "@ember/runloop";


const reFilter = /^\w+$/;


export default class SettingsChannelsController extends Controller {
	filter = "";

	@computed( "model.[]", "all", "filter" )
	get modelFiltered() {
		const filter = this.filter.toLowerCase();
		if ( !reFilter.test( filter ) ) {
			return this.model;
		}

		return this.all.filter( item =>
			item.settings.id.toLowerCase().includes( filter )
		);
	}

	@action
	async erase( modelItem ) {
		const settingsRecord = modelItem.settings;
		if ( settingsRecord.isDeleted ) { return; }

		await run( () => settingsRecord.destroyRecord() );
		this.model.removeObject( modelItem );
	}
}
