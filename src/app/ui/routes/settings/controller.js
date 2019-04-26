import Controller from "@ember/controller";
import { set, action } from "@ember/object";
import { inject as service } from "@ember/service";
import RetryTransitionMixin from "ui/routes/-mixins/controllers/retry-transition";
import "./styles.less";


export default class SettingsController extends Controller.extend( RetryTransitionMixin ) {
	/** @type {ModalService} */
	@service modal;
	/** @type {SettingsService} */
	@service settings;

	isAnimated = false;


	@action
	apply( success, failure ) {
		const settings = this.settings.content;

		this.model.applyChanges( settings );

		settings.save()
			.then( success, failure )
			.then( () => this.modal.closeModal( this ) )
			.then( () => this.retryTransition() )
			.catch( () => settings.rollbackAttributes() );
	}

	@action
	discard( success ) {
		this.model.discardChanges();

		Promise.resolve()
			.then( success )
			.then( () => this.modal.closeModal( this ) )
			.then( () => this.retryTransition() );
	}

	@action
	cancel() {
		set( this, "previousTransition", null );
		this.modal.closeModal( this );
	}
}
