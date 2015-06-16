define( [ "EmberData" ], function( DS ) {

	return DS.Model.extend({
		assets: DS.attr(),
		assets_url: DS.attr(),
		author: DS.attr(),
		body: DS.attr(),
		created_at: DS.attr(),
		draft: DS.attr( "boolean" ),
		html_url: DS.attr( "string" ),
		name: DS.attr(),
		prerelease: DS.attr(),
		published_at: DS.attr(),
		tag_name: DS.attr( "string" ),
		tarball_url: DS.attr(),
		target_commitish: DS.attr(),
		upload_url: DS.attr(),
		url: DS.attr(),
		zipball_url: DS.attr()
	}).reopenClass({
		toString: function() { return "releases"; }
	});

});
