import {
	get,
	set,
	computed,
	run,
	observer,
	on,
	Component
} from "ember";
import layout from "templates/components/SettingsSubmitComponent.hbs";


const { cancel, later } = run;


export default Component.extend({
	layout,

	classNames: [ "settings-submit-component" ],
	classNameBindings: [ "_enabled::faded" ],

	isDirty: true,
	disabled: false,

	delay: 1000,

	apply() {},
	discard() {},

	_enabled: computed(function() {
		return get( this, "isDirty" )
			&& !get( this, "disabled" );
	}),

	// immediately set enabled when disabled property changes
	_disabledObserver: observer( "disabled", function() {
		let enabled = get( this, "disabled" )
			? false
			: get( this, "isDirty" );
		set( this, "_enabled", enabled );
	}),

	// isDirty === true:  immediately set enabled to true
	// isDirty === false: wait and then set to false
	_timeout: null,
	_isDirtyObserver: observer( "isDirty", function() {
		if ( get( this, "disabled" ) ) { return; }

		this._clearTimeout();

		if ( get( this, "isDirty" ) ) {
			set( this, "_enabled", true );
		} else {
			let delay = get( this, "delay" );
			this._timeout = later( () => {
				set( this, "_enabled", false );
				this._timeout = null;
			}, delay );
		}
	}),

	_clearTimeout: on( "willDestroyElement", function() {
		if ( this._timeout ) {
			cancel( this._timeout );
			this._timeout = null;
		}
	})
});
