define(function() {

	var requireModule = global.require || global.requirejsVars.require.nodeRequire;


	return {
		load: function( name, req, onload ) {
			try {
				var module = requireModule( name );
				onload( module );
			} catch ( e ) {
				onload.error( e );
			}
		}
	};

});
