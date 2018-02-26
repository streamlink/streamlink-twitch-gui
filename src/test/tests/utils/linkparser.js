import { module, test } from "qunit";

import { parseString } from "utils/linkparser";


module( "utils/linkparser" );


test( "URLs", function( assert ) {

	assert.deepEqual(
		[
			parseString( undefined ),
			parseString( null ),
			parseString( false ),
			parseString( true ),
			parseString( {} )
		],
		[
			{
				texts: [ "" ],
				links: []
			},
			{
				texts: [ "" ],
				links: []
			},
			{
				texts: [ "" ],
				links: []
			},
			{
				texts: [ "" ],
				links: []
			},
			{
				texts: [ "[object Object]" ],
				links: []
			}
		],
		"Unexpected values"
	);

	assert.deepEqual(
		[
			// invalid starting boundary
			parseString( "foohttps://google.com" ),
			// invalid ending boundary
			parseString( "https://google.comfoo" )
		],
		[
			{
				texts: [ "foohttps://google.com" ],
				links: []
			},
			{
				texts: [ "https://google.comfoo" ],
				links: []
			}
		],
		"Invalid boundaries"
	);

	assert.deepEqual(
		[
			// just the url
			parseString( "https://google.com" ),
			// valid starting boundary
			parseString( "!https://google.com" ),
			// valid ending boundary (no path)
			parseString( "<https://google.com>" ),
			// between text
			parseString( "foo https://google.com bar" )
		],
		[
			{
				texts: [ "", "" ],
				links: [ { url: "https://google.com", text: "https://google.com" } ]
			},
			{
				texts: [ "!", "" ],
				links: [ { url: "https://google.com", text: "https://google.com" } ]
			},
			{
				texts: [ "<", ">" ],
				links: [ { url: "https://google.com", text: "https://google.com" } ]
			},
			{
				texts: [ "foo ", " bar" ],
				links: [ { url: "https://google.com", text: "https://google.com" } ]
			}
		],
		"Valid boundaries"
	);

	assert.deepEqual(
		parseString( "https://www.google.com" ),
		{
			texts: [ "", "" ],
			links: [ { url: "https://www.google.com", text: "https://www.google.com" } ]
		},
		"Sub domains"
	);

	assert.deepEqual(
		[
			parseString( "https://foo.com/bar" ),
			parseString( "<https://foo.com/>" ),
			parseString( "<https://foo.com/bar>" )
		],
		[
			{
				texts: [ "", "" ],
				links: [ { url : "https://foo.com/bar", text: "https://foo.com/bar" } ]
			},
			{
				texts: [ "<", "" ],
				links: [ { url: "https://foo.com/>", text: "https://foo.com/>" } ]
			},
			{
				texts: [ "<", "" ],
				links: [ { url: "https://foo.com/bar>", text: "https://foo.com/bar>" } ]
			}
		],
		"Paths"
	);

	assert.deepEqual(
		parseString( "http://google.com" ),
		{
			texts: [ "", "" ],
			links: [ { url: "http://google.com", text: "google.com" } ]
		},
		"Remove http protocol from link text"
	);

	assert.deepEqual(
		parseString( "google.com" ),
		{
			texts: [ "", "" ],
			links: [ { url: "http://google.com", text: "google.com" } ]
		},
		"Implicit http protocol"
	);

	assert.deepEqual(
		[
			parseString( "google.de" ),
			parseString( "cat.jpg" )
		],
		[
			{
				texts: [ "", "" ],
				links: [ { url: "http://google.de", text: "google.de" } ]
			},
			{
				texts: [ "cat.jpg" ],
				links: []
			}
		],
		"TLDs"
	);

	assert.deepEqual(
		parseString( "foo.com:8080/bar" ),
		{
			texts: [ "", "" ],
			links: [ { url: "http://foo.com:8080/bar", text: "foo.com:8080/bar" } ]
		},
		"Port number"
	);

	assert.deepEqual(
		parseString( "http://sub.host.com/path/subpath?a=b&c#d" ),
		{
			texts: [ "", "" ],
			links: [{
				url : "http://sub.host.com/path/subpath?a=b&c#d",
				text: "sub.host.com/path/subpath?a=b&c#d"
			}]
		},
		"Path + query + hash"
	);

	assert.deepEqual(
		parseString( "foo bar.com baz.com qux.com quux" ),
		{
			texts: [ "foo ", " ", " ", " quux" ],
			links: [
				{ url: "http://bar.com", text: "bar.com" },
				{ url: "http://baz.com", text: "baz.com" },
				{ url: "http://qux.com", text: "qux.com" }
			]
		},
		"Multiple matches"
	);

});


test( "Twitter", function( assert ) {

	assert.deepEqual(
		parseString( "@foo" ),
		{
			texts: [ "", "" ],
			links: [ { url: "https://twitter.com/foo", text: "@foo" } ]
		},
		"Simple test"
	);

	assert.deepEqual(
		parseString( "name@mail.com" ),
		{
			texts: [ "name@mail.com" ],
			links: []
		},
		"Email test"
	);

	assert.deepEqual(
		parseString( "!@foo..." ),
		{
			texts: [ "!", "..." ],
			links: [ { url: "https://twitter.com/foo", text: "@foo" } ]
		},
		"Special char boundaries"
	);

	assert.deepEqual(
		parseString( "@myusernameiswaytoolongfortwitter" ),
		{
			texts: [ "@myusernameiswaytoolongfortwitter" ],
			links: []
		},
		"Username length"
	);

	assert.deepEqual(
		parseString( "foo @bar @baz @qux quux" ),
		{
			texts: [ "foo ", " ", " ", " quux" ],
			links: [
				{ url: "https://twitter.com/bar", text: "@bar" },
				{ url: "https://twitter.com/baz", text: "@baz" },
				{ url: "https://twitter.com/qux", text: "@qux" }
			]
		},
		"Multiple matches"
	);

});


test( "Subreddit", function( assert ) {

	assert.deepEqual(
		parseString( "/r/all /r/all/" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{ url: "https://www.reddit.com/r/all", text: "/r/all" },
				{ url: "https://www.reddit.com/r/all", text: "/r/all" }
			]
		},
		"Implicit subreddit match"
	);

	assert.deepEqual(
		parseString( "https://www.reddit.com/r/all https://www.reddit.com/r/all/" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{ url: "https://www.reddit.com/r/all", text: "/r/all" },
				{ url: "https://www.reddit.com/r/all", text: "/r/all" }
			]
		},
		"Explicit subreddit match"
	);

	assert.deepEqual(
		parseString( "https://www.reddit.com https://www.reddit.com/r/subreddit/comments/abcdef" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{
					url: "https://www.reddit.com",
					text: "https://www.reddit.com"
				},
				{
					url: "https://www.reddit.com/r/subreddit/comments/abcdef",
					text: "https://www.reddit.com/r/subreddit/comments/abcdef"
				}
			]
		},
		"Non-matching subreddit links"
	);

});


test( "Reddit user", function( assert ) {

	assert.deepEqual(
		parseString( "/u/name /u/name/" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{ url: "https://www.reddit.com/u/name", text: "/u/name" },
				{ url: "https://www.reddit.com/u/name", text: "/u/name" }
			]
		},
		"Implicit reddit user match (short)"
	);

	assert.deepEqual(
		parseString( "/user/name /user/name" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{ url: "https://www.reddit.com/u/name", text: "/u/name" },
				{ url: "https://www.reddit.com/u/name", text: "/u/name" }
			]
		},
		"Implicit reddit user match (long)"
	);

	assert.deepEqual(
		parseString( "https://www.reddit.com/u/name https://www.reddit.com/u/name/" ),
		{
			texts: [ "", " ", "" ],
			links: [
				{ url: "https://www.reddit.com/u/name", text: "/u/name" },
				{ url: "https://www.reddit.com/u/name", text: "/u/name" }
			]
		},
		"Explicit reddit user match"
	);

});


test( "All parsers", function( assert ) {

	assert.deepEqual(
		parseString( "Follow @foo and visit bar.com or follow /u/baz and visit /r/qux" ),
		{
			texts: [ "Follow ", " and visit ", " or follow ", " and visit ", "" ],
			links: [
				{ url: "https://twitter.com/foo", text: "@foo" },
				{ url: "http://bar.com", text: "bar.com" },
				{ url: "https://www.reddit.com/u/baz", text: "/u/baz" },
				{ url: "https://www.reddit.com/r/qux", text: "/r/qux" }
			]
		},
		"Multiple matches"
	);

});
