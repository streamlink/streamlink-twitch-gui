// dirty, but does its simple job
const reFileNameLine = /^(\s*".+"\s*:\s*)"(.+\.\w+)"(\s*,?\s*)$/;
const strFileNameLine = "$1require(\"$2\")$3";


module.exports = function( content ) {
	const output = JSON.stringify( JSON.parse( content ), undefined, "\t" )
		.split( "\n" )
		.map( line => line.replace( reFileNameLine, strFileNameLine ) )
		.join( "\n" );

	return `module.exports = ${output};`;
};
