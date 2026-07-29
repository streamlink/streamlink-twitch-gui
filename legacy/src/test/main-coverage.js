import "./main";


function importAll( r ) {
	r.keys().forEach( r );
}

importAll( require.context( "root/app/", true, /^\.\/(?!(main|app|logger)\.js$).+\.js$/ ) );
