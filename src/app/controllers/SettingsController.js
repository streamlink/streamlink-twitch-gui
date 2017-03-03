import {
	get,
	set,
	computed,
	inject,
	Controller
} from "Ember";
import { streamprovider } from "config";
import RetryTransitionMixin from "mixins/RetryTransitionMixin";


const { service } = inject;
const { providers } = streamprovider;


export default Controller.extend( RetryTransitionMixin, {
	modal: service(),
	settings: service(),

	isAnimated: false,


	// TODO: remove this once Livestreamer support gets dropped
	// this property is being used by the main menu
	streamproviderName: computed( "model.streamprovider", function() {
		let streamprovider = get( this, "model.streamprovider" );

		return providers[ streamprovider ][ "name" ];
	}),


	actions: {
		apply( success, failure ) {
			const modal = get( this, "modal" );
			const settings = get( this, "settings.content" );

			get( this, "model" ).applyChanges( settings );

			settings.save()
				.then( success, failure )
				.then( () => modal.closeModal( this ) )
				.then( () => this.retryTransition() )
				.catch( () => settings.rollbackAttributes() );
		},

		discard( success ) {
			const modal = get( this, "modal" );

			get( this, "model" ).discardChanges();

			Promise.resolve()
				.then( success )
				.then( () => modal.closeModal( this ) )
				.then( () => this.retryTransition() );
		},

		cancel() {
			set( this, "previousTransition", null );
			get( this, "modal" ).closeModal( this );
		}
	}
});
