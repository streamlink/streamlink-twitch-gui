import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ObjectBuffer from "utils/ember/ObjectBuffer";


export default Route.extend({
	modal: service(),

	async model() {
		const store = get( this, "store" );
		const parentModel = this.modelFor( "channel" );
		const id = get( parentModel, "channel.name" );

		const model = await store.findRecord( "channelSettings", id )
			.catch( () => {
				// get the record automatically created by store.findRecord()
				const model = store.recordForId( "channelSettings", id );
				// transition from `root.empty` to `root.loaded.created.uncommitted`
				model._internalModel.loadedData();

				return model;
			});

		// use a buffer proxy object as model
		const content = model.toJSON();
		const buffer = ObjectBuffer.create({ content });

		return { model, buffer };
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	},

	actions: {
		willTransition( previousTransition ) {
			const controller = get( this, "controller" );

			// check whether the user has changed any values
			if ( !get( controller, "model.buffer.isDirty" ) ) {
				// don't keep the channelSettings records in cache
				return get( this, "store" ).unloadAll( "channelSettings" );
			}

			// stay here...
			previousTransition.abort();

			// and let the user decide
			get( this, "modal" ).openModal( "confirm", controller, {
				previousTransition
			});
		}
	}
});
