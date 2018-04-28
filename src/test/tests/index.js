function importAll( r ) {
	r.keys().forEach( r );
}

// import tests in a certain order instead of importing them alphabetically
importAll( require.context( "qunit/test/", true, /\.js$/ ) );
importAll( require.context( "./loaders/", true, /\.js$/ ) );
importAll( require.context( "./nwjs/", true, /\.js$/ ) );
importAll( require.context( "./utils/", true, /\.js$/ ) );
importAll( require.context( "./data/", true, /\.js$/ ) );
importAll( require.context( "./init/", true, /\.js$/ ) );
importAll( require.context( "./ui/", true, /\.js$/ ) );
importAll( require.context( "./services/", true, /\.js$/ ) );
