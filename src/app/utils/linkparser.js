import { TLDs as arrTLDs } from "global-tld-list";
import { toUnicode as punycodeToUnicode } from "punycode";


const TLDs = new Set( arrTLDs );
const reHostname = "[a-z0-9\u00C0-\uFFFF-]";
const reHost = `${reHostname}+(?:\\.${reHostname}+)*`;

const reURL = new RegExp([
	// boundary (no look-behind)
	"(^|(?:^|\\s)[^a-z]?)",
	// scheme
	"(https?:\\/\\/)?",
	// netloc
	`(${reHost}\\.(${reHostname}{2,})\\.?(?::\\d{2,5})?)`,
	// path
	"(\\/\\S*)?",
	// boundary
	"(\\W|\\s|$)"
].join( "" ), "igm" );

function fnURL( _, __, scheme, netloc, tld, path ) {
	if ( tld.length > 4 && tld.startsWith( "xn--" ) ) {
		// noinspection JSDeprecatedSymbols
		tld = punycodeToUnicode( tld );
	} else {
		tld = tld.toLowerCase();
	}
	if ( !TLDs.has( tld ) ) { return; }

	scheme = scheme || "";
	path = path || "";

	// assume implicit http protocol
	let urlScheme = scheme ? scheme : "http://";
	// hide implicit http prototcol in link text
	let textScheme = scheme === "http://" ? "" : scheme;

	// noinspection JSDeprecatedSymbols
	let textNetloc = punycodeToUnicode( netloc );

	return {
		url : `${urlScheme}${netloc}${path}`,
		text: `${textScheme}${textNetloc}${path}`
	};
}


const reTwitter = new RegExp([
	// boundary (no look-behind)
	"(^|\\W)",
	// username
	"@(\\w{1,15})",
	// boundary
	"(\\W|$)"
].join( "" ), "igm" );

function fnTwitter( _, __, user ) {
	return {
		url : `https://twitter.com/${user}`,
		text: `@${user}`
	};
}


const reSubreddit = new RegExp([
	// boundary (no look-behind)
	"(^|\\W)",
	// optional reddit URL
	`(?:https?://(?:${reHostname}+\\.)*reddit\\.com)?`,
	// subreddit
	"/r/([\\w-]+)/?",
	// boundary
	"([^\\w/-]|$)"
].join( "" ), "igm" );

function fnSubreddit( _, __, subreddit ) {
	return {
		url : `https://www.reddit.com/r/${subreddit}`,
		text: `/r/${subreddit}`
	};
}


const reRedditUser = new RegExp([
	// boundary (no look-behind)
	"(^|\\W)",
	// optional reddit URL
	`(?:https?://(?:${reHostname}+\\.)*reddit\\.com)?`,
	// user
	"/u(?:ser)?/([\\w-]+)/?",
	// boundary
	"([^\\w/-]|$)"
].join( "" ), "igm" );

function fnRedditUser( _, __, user ) {
	return {
		url : `https://www.reddit.com/u/${user}`,
		text: `/u/${user}`
	};
}


export const parsers = {
	subreddit: {
		re: reSubreddit,
		fn: fnSubreddit
	},
	reddituser: {
		re: reRedditUser,
		fn: fnRedditUser
	},
	url: {
		re: reURL,
		fn: fnURL
	},
	twitter: {
		re: reTwitter,
		fn: fnTwitter
	}
};


const kParsers = Object.keys( parsers );


export function parseString( string ) {
	if ( typeof string !== "string" ) {
		string = string instanceof Object
			? string.toString()
			: "";
	}

	let texts = [ string ];
	let links = [];

	// do this for each existing expression
	kParsers.forEach(function( key ) {
		let item = parsers[ key ];
		let re = item.re;
		let fn = item.fn;
		let match, linkObj, length;

		// iterate through all text elements
		// length will increase on each match by one
		for ( let current, i = 0; i < texts.length; i++ ) {
			current = texts[ i ];
			// reset the lastIndex of the regexp, so it can match multiple times on new strings
			re.lastIndex = 0;

			// did it match?
			if ( !( match = re.exec( current ) ) ) {
				continue;
			}

			// create the linkObj from the parser function
			linkObj = fn( ...match );
			// was parsing successful?
			if ( !linkObj ) {
				continue;
			}

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
		texts,
		links
	};
}
