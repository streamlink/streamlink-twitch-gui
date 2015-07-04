define( [ "EmberData" ], function( DS ) {

	return DS.RESTSerializer.extend({
		modelNameFromPayloadKey: function() {
			return "githubReleases";
		},

		normalizePayload: function( payload ) {
			return {
				githubReleases: payload
			};
		}
	});

});
