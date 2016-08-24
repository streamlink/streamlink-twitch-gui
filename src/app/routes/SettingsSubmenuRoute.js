import Ember from "Ember";


var set = Ember.set;


export default Ember.Route.extend({
	controllerName: "settings",

	disableAutoRefresh: true,

	model: function() {
		return this.modelFor( "settings" );
	},

	activate: function() {
		var settingsController = this.controllerFor( "settings" );
		set( settingsController, "currentSubmenu", this.routeName );
	},

	deactivate: function() {
		var settingsController = this.controllerFor( "settings" );
		set( settingsController, "isAnimated", true );
	}
});
