define(function() {

	// need to trick phantomjs here... can't export the wrap function bound with arguments
	function wrap( fn ) {
		return function( replacement ) {
			return function() {
				return fn.apply( replacement, arguments );
			};
		};
	}


	// most common gTLDs... a little overkill, but
	// we don't want to match something like cat.jpg
	var	list_gTLD	= [
			"com", "org", "net", "int", "biz", "pro", "edu", "gov", "mil",
			"info", "name", "mobi", "jobs", "pics", "link", "wiki", "asia"
		],
		re_tld		= "(?:[a-z]{2}|" + list_gTLD.join( "|" ) + ")",
		re_host		= "(?:[a-z0-9\u00C0-\uFFFF-]+\\.)",


		linkurl_re	= new RegExp([
			// boundary (no look-behind)
			"(^|(?:^|\\s)[^a-z]?)",
			// scheme
			"((?:http|ftp)s?:\\/\\/)?",
			// user:pass@sub.host.tld:port
			"((?:\\w+(?::\\w+)?@)?" + re_host + "+" + re_tld + "(?::\\d{2,5})?)",
			// path
			"(\\/\\S*)?",
			// boundary
			"(?=[^a-z]|\\s|$)"
		].join( "" ), "igm" ),
		linkurl_fn	= function( _, lookbehind, scheme, host, path ) {
			return this.fmt(
				lookbehind,
				"%@%@%@".fmt( scheme ? scheme : "http://", host, path ),
				// hide implicit http prototcol in link text
				"%@%@%@".fmt( scheme === "http://" ? "" : scheme, host, path )
			);
		},

		twitter_re	= new RegExp([
			// boundary (no look-behind)
			"(^|\\W)",
			// username
			"@(\\w{1,15})",
			// boundary
			"(?=\\W|$)"
		].join( "" ), "igm" ),
		twitter_fn	= function( _, lookbehind, user ) {
			return this.fmt(
				lookbehind,
				"https://twitter.com/" + user,
				"@" + user
			);
		};


	return {
		linkurl_re	: linkurl_re,
		linkurl_fn	: wrap( linkurl_fn ),

		twitter_re	: twitter_re,
		twitter_fn	: wrap( twitter_fn )
	};

});
