// most common gTLDs... a little overkill, but
// we don't want to match something like cat.jpg
var gTLD   = [
	"com", "org", "net", "int", "biz", "pro", "edu", "gov", "mil",
	"info", "name", "mobi", "jobs", "pics", "link", "wiki", "asia"
];
var reTLD  = "(?:[a-z]{2}|" + gTLD.join( "|" ) + ")";
var reHost = "(?:[a-z0-9\u00C0-\uFFFF-]+\\.)";


var reURL = new RegExp([
	// boundary (no look-behind)
	"(^|(?:^|\\s)[^a-z]?)",
	// scheme
	"(https?:\\/\\/)?",
	// sub.host.tld:port
	"(" + reHost + "+" + reTLD + "(?::\\d{2,5})?)",
	// path
	"(\\/\\S*)?",
	// boundary
	"(\\W|\\s|$)"
].join( "" ), "igm" );

function fnURL( _, __, scheme, host, path ) {
	return {
		// assume implicit http protocol
		url : ( scheme ? scheme : "http://" ) + ( host || "" ) + ( path || "" ),
		// hide implicit http prototcol in link text
		text: ( scheme === "http://" ? "" : scheme || "" ) + ( host || "" ) + ( path || "" )
	};
}


var reTwitter = new RegExp([
	// boundary (no look-behind)
	"(^|\\W)",
	// username
	"@(\\w{1,15})",
	// boundary
	"(\\W|$)"
].join( "" ), "igm" );

function fnTwitter( _, __, user ) {
	return {
		url : "https://twitter.com/" + user,
		text: "@" + user
	};
}


var parsers = {
	url: {
		re: reURL,
		fn: fnURL
	},
	twitter: {
		re: reTwitter,
		fn: fnTwitter
	}
};

var kParsers = Object.keys( parsers );

function parseString( string ) {
	if ( typeof string !== "string" ) {
		string = string instanceof Object
			? string.toString()
			: "";
	}

	var texts = [ string ];
	var links = [];

	// do this for each existing expression
	kParsers.forEach(function( key ) {
		var item = parsers[ key ];
		var re = item.re;
		var fn = item.fn;
		var match, linkObj, length;

		// iterate through all text elements
		// length will increase on each match by one
		for ( var current, i = 0; i < texts.length; i++ ) {
			current = texts[ i ];
			// reset the lastIndex of the regexp, so it can match multiple times on new strings
			re.lastIndex = 0;

			// did it match?
			if ( !( match = re.exec( current ) ) ) {
				continue;
			}

			// create the linkObj out of the parser function
			linkObj = fn.apply( null, match );

			// update the current text item:
			// everything from the beginning to the match index (including the "lookbehind")
			length = match.index + match[ 1 ].length;
			texts[ i ] = current.substr( 0, length );

			// create a new text item after the current position:
			// everything from the match ending (including the "lookahead") to the string end
			length = match[ match.length - 1 ].length;
			texts.splice( i + 1, 0, current.substr( re.lastIndex - length ) );

			// insert the linkObj after the current position
			links.splice( i, 0, linkObj );
		}
	});

	return {
		texts: texts,
		links: links
	};
}


export default {
	parsers    : parsers,
	parseString: parseString
};
