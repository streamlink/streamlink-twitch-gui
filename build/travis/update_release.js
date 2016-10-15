[
	"TRAVIS_REPO_SLUG",
	"TRAVIS_TAG",
	"RELEASES_API_KEY"
].forEach( v => {
	if ( !process.env.hasOwnProperty( v ) ) {
		process.stderr.write( `Missing env var ${v}\n` );
		process.exit( 1 );
	}
});


const HTTPS = require( "https" );
const FS = require( "fs" );
const PATH = require( "path" );


function githubAPI( request, data ) {
	request.hostname = "api.github.com";
	request.headers = request.headers || {};
	request.headers[ "Accept" ] = "application/vnd.github.v3+json";
	request.headers[ "User-Agent" ] = `${process.env.TRAVIS_REPO_SLUG}`;
	request.headers[ "Authorization" ] = `token ${process.env.RELEASES_API_KEY}`;

	return new Promise( ( resolve, reject ) => {
		let req = HTTPS.request( request, response => {
			let buffer = [];
			let done = response.statusCode >= 200 && response.statusCode < 300 ? resolve : reject;
			response.on( "data", d => buffer.push( d ) );
			response.on( "end", () => done( JSON.parse( buffer.join( "" ) ) ) );
		});
		req.on( "error", reject );
		if ( data ) {
			req.write( data );
		}
		req.end();
	});
}

function readFile( ...path ) {
	return new Promise( ( resolve, reject ) => {
		FS.readFile(
			PATH.resolve( ...path ),
			( err, data ) => err ? reject( err ) : resolve( data.toString() )
		);
	});
}


Promise.all([
	readFile( __dirname, "data", "releases.md" ),
	githubAPI({
		path: `/repos/${process.env.TRAVIS_REPO_SLUG}/releases/tags/${process.env.TRAVIS_TAG}`
	})
])
	.then( ([ body, { id, tag_name: name } ]) => {
		return githubAPI({
			method: "PATCH",
			path: `/repos/${process.env.TRAVIS_REPO_SLUG}/releases/${id}`
		}, JSON.stringify({
			name,
			body
		}) );
	})
	.then( () => {
		process.stdout.write( "Release has been updated!\n" );
		process.exit( 0 );
	}, err => {
		process.stderr.write( "Error while trying to update release!\n" );
		process.stderr.write( `${JSON.stringify( err )}\n` );
		process.exit( 1 );
	});
