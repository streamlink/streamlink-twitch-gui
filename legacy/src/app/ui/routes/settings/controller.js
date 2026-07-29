import Controller from "@ember/controller";
import { get, set } from "@ember/object";
import { inject as service } from "@ember/service";
import RetryTransitionMixin from "ui/routes/-mixins/controllers/retry-transition";
import "./styles.less";


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
