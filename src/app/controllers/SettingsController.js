import {
	get,
	set,
	inject,
	Controller
} from "ember";
import RetryTransitionMixin from "mixins/RetryTransitionMixin";


const { service } = inject;


export default Controller.extend( RetryTransitionMixin, {
	modal: service(),
	settings: service(),

	isAnimated: false,


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
