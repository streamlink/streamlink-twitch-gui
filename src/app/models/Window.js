define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({

		width : DS.attr( "number", { defaultValue: null } ),
		height: DS.attr( "number", { defaultValue: null } ),
		x     : DS.attr( "number", { defaultValue: null } ),
		y     : DS.attr( "number", { defaultValue: null } )

	}).reopenClass({
		toString: function() { return "Window"; }
	});

});
