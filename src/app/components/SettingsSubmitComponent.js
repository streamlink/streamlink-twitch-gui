import Ember from "Ember";
import layout from "templates/components/SettingsSubmitComponent.hbs";


var get = Ember.get;
var set = Ember.set;
var cancel = Ember.run.cancel;
var later = Ember.run.later;


export default Ember.Component.extend({
	layout,

	classNames: [ "settings-submit-component" ],
	classNameBindings: [ "_enabled::faded" ],

	isDirty: true,
	disabled: false,

	delay: 1000,

	apply: "apply",
	discard: "discard",

	_enabled: function() {
		return get( this, "isDirty" )
			&& !get( this, "disabled" );
	}.property(),

	// immediately set enabled when disabled property changes
	_disabledObserver: function() {
		var enabled = get( this, "disabled" )
			? false
			: get( this, "isDirty" );
		set( this, "_enabled", enabled );
	}.observes( "disabled" ),

	// isDirty === true:  immediately set enabled to true
	// isDirty === false: wait and then set to false
	_timeout: null,
	_isDirtyObserver: function() {
		if ( get( this, "disabled" ) ) { return; }

		this._clearTimeout();

		if ( get( this, "isDirty" ) ) {
			set( this, "_enabled", true );
		} else {
			this._timeout = later( this, function() {
				set( this, "_enabled", false );
			}, get( this, "delay" ) );
		}
	}.observes( "isDirty" ),

	_clearTimeout: function() {
		if ( this._timeout ) {
			cancel( this._timeout );
			this._timeout = null;
		}
	}.on( "willDestroyElement" )
});
