var PATH = require( "path" );


module.exports = {
	chocolatey: {
		command: [
			"cd " + PATH.resolve( "build", "package", "chocolatey" ),
			"choco pack -y"
		].join( " && " )
	}
};
