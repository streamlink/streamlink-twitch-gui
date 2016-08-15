module.exports = function( input ) {
	this.cacheable();

	// dirty, but does its simple job
	var reFileNameLine  = /^(\s*".+"\s*:\s*)"(.+\.\w+)"(\s*,?\s*)$/;
	var strFileNameLine = "$1require(\"$2\")$3";

	var output = JSON.stringify( JSON.parse( input ), undefined, "\t" )
		.split( "\n" )
		.map(function( line ) {
			return line.replace( reFileNameLine, strFileNameLine );
		})
		.join( "\n" );

	return "module.exports = " + output + ";";
};
