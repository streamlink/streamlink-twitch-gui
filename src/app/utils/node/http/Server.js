import HTTP from "http";
import URL from "url";


function Route( method, url, callback ) {
	this.method   = method;
	this.url      = url;
	this.isRegExp = url instanceof RegExp;
	this.callback = callback;
}

function Server( port, timeout ) {
	var self = this;

	this.routes = [];
	this.server = HTTP.createServer();
	this.server.setTimeout( timeout || 120000 );
	this.server.listen( port, function() {
		self.server.on( "request", self.handleRequest.bind( self ) );
	});
	this.server.on( "close", function() {
		self.routes = null;
		self.server = null;
	});
}

Server.prototype.handleRequest = function handleRequest( request, response ) {
	var matched = false;

	// parse url
	request.url = URL.parse( request.url, true );

	this.routes.some(function( route ) {
		var match = route.method === request.method
			&& ( route.isRegExp
				? route.url.test( request.url.pathname )
				: route.url === request.url.pathname
			);

		// next route
		if ( !match ) { return false; }
		matched = true;

		// last route
		var result = route.callback( request, response );
		if ( result === true ) {
			return true;
		}
	});

	// no route matched
	if ( !matched ) {
		response.statusCode = 404;
		response.end( "404" );
	}
};

Server.prototype.onRequest = function onRequest( method, url, callback ) {
	this.routes.push( new Route( method, url, callback ) );
};

Server.prototype.close = function close() {
	this.server.close();
};


export default Server;
