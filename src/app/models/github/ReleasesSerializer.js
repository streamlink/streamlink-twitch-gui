define( [ "ember-data" ], function( DS ) {

	return DS.RESTSerializer.extend({
		typeForRoot: function() {
			return "githubReleases";
		},

		normalizePayload: function( payload ) {
			return {
				githubReleases: payload
			};
		}
	});

});
