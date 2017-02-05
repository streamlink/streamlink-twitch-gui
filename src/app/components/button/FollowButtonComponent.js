import {
	get,
	set,
	run,
	Component
} from "Ember";
import TwitchInteractButtonMixin from "mixins/TwitchInteractButtonMixin";
import layout from "templates/components/button/FollowButtonComponent.hbs";


const { cancel, later } = run;


export default Component.extend( TwitchInteractButtonMixin, {
	layout,

	classNames: [
		"follow-button-component"
	],
	classNameBindings: [
		"isExpanded:expanded"
	],
	title: "",

	isExpanded: false,
	isPromptVisible: false,

	didInsertElement() {
		this._super( ...arguments );
		this.$confirmbutton = this.$( ".confirm-button" );
	},

	expand() {
		set( this, "isExpanded", true );
		set( this, "isPromptVisible", true );
	},

	collapse() {
		set( this, "isExpanded", false );

		return new Promise( r => this.$confirmbutton.one( "webkitTransitionEnd", r ) )
			.then( () => set( this, "isPromptVisible", false ) );
	},

	mouseEnter() {
		if ( this._clearTimer() ) {
			this.expand();
		}
	},

	mouseLeave() {
		this._clearTimer();
		if ( get( this, "isExpanded" ) ) {
			this._timer = later( () => {
				this._timer = null;
				this.collapse();
			}, 1000 );
		}
	},

	_clearTimer() {
		if ( !this._timer ) {
			return false;
		}
		cancel( this._timer );
		this._timer = null;
		this.$confirmbutton.off( "webkitTransitionEnd" );
		return true;
	},


	actions: {
		expand() {
			this.expand();
		},

		collapse() {
			this.collapse();
		},

		follow( success, failure ) {
			if (
				   !this.modelName
				|| !get( this, "isValid" )
				|| get( this, "isLocked" )
				|| get( this, "record" )
			) {
				return;
			}
			set( this, "isLocked", true );

			const store = get( this, "store" );
			const id = get( this, "id" );

			// create a new record and save it
			store.createRecord( this.modelName, { id } )
				.save()
				.then( record => set( this, "record", record ) )
				.then( success, failure )
				.finally( () => set( this, "isLocked", false ) );
		},

		unfollow( success, failure ) {
			const record = get( this, "record" );

			if (
				   !record
				|| !get( this, "isValid" )
				|| get( this, "isLocked" )
			) {
				return;
			}
			set( this, "isLocked", true );

			const store = get( this, "store" );

			// delete the record and save it
			record.destroyRecord()
				.then( () => {
					set( this, "record", false );
					// also unload it
					store.unloadRecord( record );
				})
				.then( success, failure )
				.then( () => this.collapse() )
				.finally( () => set( this, "isLocked", false ) );
		}
	}
});
