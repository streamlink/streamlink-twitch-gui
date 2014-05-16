define( [ "ember-data" ], function( DS ) {

	return DS.Model.extend({
		tag_name: DS.attr( "string" ),
		html_url: DS.attr( "string" ),
		draft: DS.attr( "boolean" )
	}).reopenClass({
		toString: function() { return "releases"; }
	});

});
