import { getOwner } from "@ember/application";
import { get } from "@ember/object";
import { inject as service } from "@ember/service";
import UserIndexRoute from "ui/routes/user/index/route";
import ObjectBuffer from "utils/ember/ObjectBuffer";


export default UserIndexRoute.extend({
	modal: service(),

	async model() {
		const { /** @type {DS.Store} */ store } = this;
		const { user: { id } } = this.modelFor( "channel" );

		const model = await store.findRecord( "channelSettings", id )
			.catch( () => {
				// get the record automatically created by store.findRecord()
				const model = store.recordForId( "channelSettings", id );
				// transition from `root.empty` to `root.loaded.created.uncommitted`
				model.transitionTo( "loaded.created.uncommitted" );

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
