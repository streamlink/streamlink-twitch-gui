define(function() {

	return {
		pluginBuilder: "file",

		load: function ( name, req, onload ) {
			req( [ name ], onload );
		}
	};

});
