const { createHash } = require( "crypto" );
const { createReadStream } = require( "fs" );


module.exports = async function hash( file, algorithm = "sha256", encoding = "hex" ) {
	return new Promise( ( resolve, reject ) => {
		const hash = createHash( algorithm );
		hash.setEncoding( encoding );

		const stream = createReadStream( file );
		stream.on( "error", reject );
		stream.on( "end", () => {
			hash.end();
			resolve( hash.read() );
		});
		stream.pipe( hash );
	});
};
