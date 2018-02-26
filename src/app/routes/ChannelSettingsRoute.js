import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ObjectBuffer from "utils/ember/ObjectBuffer";


export default Route.extend({
	modal: service(),

	model() {
		const store = get( this, "store" );
		const model = this.modelFor( "channel" );
		const name = get( model, "channel.name" );

		return store.findRecord( "channelSettings", name )
			.catch(function() {
				// get the record automatically created by store.findRecord()
				const record = store.recordForId( "channelSettings", name );
				// transition from `root.empty` to `root.loaded.created.uncommitted`
				record._internalModel.loadedData();
				return record;
			})
			// use a buffer proxy object as model
			.then( model => ({
				model,
				buffer: ObjectBuffer.create({
					content: model.toJSON()
				})
			}) );
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
