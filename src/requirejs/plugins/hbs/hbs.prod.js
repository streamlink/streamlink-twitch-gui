define([
	"Ember"
], function(
	Ember
) {

	var template = Ember.HTMLBars.template;


	return {
		pluginBuilder: "hbs",

		load: function ( name, req, onload ) {
			req( [ name ], function( fnTemplate ) {
				var compiled = template( fnTemplate );
				onload( compiled );
			});
		}
	};

});
