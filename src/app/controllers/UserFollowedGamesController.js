import Ember from "Ember";


	var get = Ember.get;
	var set = Ember.set;


	export default Ember.Controller.extend({
		queryParams: [ "all" ],

		actions: {
			"toggleAll": function() {
				// query parameters are strings
				set( this, "all", get( this, "all" ) === "true" ? "false" : "true" );
			}
		}
	});
