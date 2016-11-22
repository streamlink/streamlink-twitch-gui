var NwBuilder = require( "nw-builder" );
var platforms = require( "./platforms" );
var nwjsOptions = require( "../configs/nwjs" ).options;


function NwjsPlugin( options ) {
	this.options = Object.assign( {}, nwjsOptions, options, {
		flavor: "sdk",
		platforms: platforms.getPlatforms( [] )
	});
	this.built = false;
}

NwjsPlugin.prototype.apply = function( compiler ) {
	var self = this;

	compiler.plugin( "done", function() {
		if ( !self.built ) {
			self.run();
		}
		self.built = true;
	});
};

NwjsPlugin.prototype.run = function() {
	var options = this.options;

	function log( msg ) {
		console.log( String( msg ) );
	}

	function launch() {
		var nw = new NwBuilder( options );

		if ( options.log ) {
			nw.on( "log", log );
		}
		if ( options.log && options.logStdOut ) {
			nw.on( "stdout", log );
		}
		if ( options.log && options.logStdErr ) {
			nw.on( "stderr", log );
		}

		nw.run().then(function() {
			if ( options.rerunOnExit ) {
				setTimeout( launch, 1000 );
			}
		});
	}

	launch();
};


module.exports = NwjsPlugin;
