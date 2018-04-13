const { readFile: readFileFS } = require( "fs" );
const loaderUtils = require( "loader-utils" );
const promisify = require( "util.promisify" );


// dirty, but does its simple job
const reFileNameLine = /^(\s*".+"\s*:\s*)"(.+\.\w+)"(\s*,?\s*)$/;
const strFileNameLine = "$1require(\"$2\")$3";


module.exports = function() {
	const callback = this.async();
	const options = loaderUtils.getOptions( this );

	/**
	 * @type {Function}
	 * @returns {Promise}
	 */
	const readFile = promisify( readFileFS );
	/**
	 * @type {Function}
	 * @returns {Promise}
	 */
	const resolve = promisify( this.resolve.bind( this ) );


	function output( content ) {
		const output = JSON.stringify( JSON.parse( content ), undefined, "\t" )
			.split( "\n" )
			.map( line => line.replace( reFileNameLine, strFileNameLine ) )
			.join( "\n" );

		return `module.exports = { __esModule: true, default: ${output} };`;
	}

	resolve( this.context, options.file )
		.then( file => {
			this.addDependency( file );
			return file;
		})
		.then( readFile )
		.then( String )
		.then( output )
		.then(
			data => callback( null, data ),
			err => callback( err )
		);
};
