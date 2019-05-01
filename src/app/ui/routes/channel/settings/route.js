import { getOwner } from "@ember/application";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ObjectBuffer from "utils/ember/ObjectBuffer";


export default class ChannelSettingsRoute extends Route {
	/** @type {ModalService} */
	@service modal;

	async model() {
		const store = this.store;
		const parentModel = this.modelFor( "channel" );
		const id = parentModel.channel.name;

		const model = await store.findRecord( "channel-settings", id )
			.catch( () => {
				// get the record automatically created by store.findRecord()
				const model = store.recordForId( "channel-settings", id );
				// transition from `root.empty` to `root.loaded.created.uncommitted`
				model.transitionTo( "loaded.created.uncommitted" );

				return model;
			});

		// use a buffer proxy object as model
		const content = model.toJSON();
		const buffer = ObjectBuffer.create({ content });

		return { model, buffer };
	}

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}

	@action
	willTransition( previousTransition ) {
		const controller = this.controller;

		// check whether the user has changed any values
		if ( !controller.model.buffer.isDirty ) {
			// don't keep the channelSettings records in cache
			return this.store.unloadAll( "channel-settings" );
		}

		// stay here...
		previousTransition.abort();

		// and let the user decide
		this.modal.openModal( "confirm", controller, {
			previousTransition
		});
	}
}
