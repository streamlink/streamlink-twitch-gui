define(function() {

	return {
		pluginBuilder: "json",

		load: function ( name, req, onload ) {
			req( [ name ], onload );
		}
	};

});
