import { module, test } from "qunit";

import { parseString } from "utils/linkparser";


module( "utils/linkparser", function() {
	test( "invalid URLs", function( assert ) {
		assert.propEqual( parseString( undefined ), { texts: [ "" ], links: [] }, "undefined" );
		assert.propEqual( parseString( null ), { texts: [ "" ], links: [] }, "null" );
		assert.propEqual( parseString( false ), { texts: [ "" ], links: [] }, "false" );
		assert.propEqual( parseString( true ), { texts: [ "" ], links: [] }, "true" );
		assert.propEqual( parseString( {} ), { texts: [ "[object Object]" ], links: [] }, "obj" );
	});

	test( "URL boundaries", function( assert ) {
		assert.propEqual(
			parseString( "foohttps://google.com" ),
			{
				texts: [ "foohttps://google.com" ],
				links: []
			},
			"invalid starting boundary"
		);
		assert.propEqual(
			parseString( "https://google.comfoo" ),
			{
				texts: [ "https://google.comfoo" ],
				links: []
			},
			"invalid ending boundary"
		);

		assert.propEqual(
			parseString( "http://google.com" ),
			{
				texts: [ "", "" ],
				links: [ { url: "http://google.com", text: "http://google.com" } ]
			},
			"just the url"
		);
		assert.propEqual(
			parseString( "!http://google.com" ),
			{
				texts: [ "!", "" ],
				links: [ { url: "http://google.com", text: "http://google.com" } ]
			},
			"valid starting boundary"
		);
		assert.propEqual(
			parseString( "<http://google.com>" ),
			{
				texts: [ "<", ">" ],
				links: [ { url: "http://google.com", text: "http://google.com" } ]
			},
			"valid ending boundary (no path)"
		);
		assert.propEqual(
			parseString( "foo http://google.com bar" ),
			{
				texts: [ "foo ", " bar" ],
				links: [ { url: "http://google.com", text: "http://google.com" } ]
			},
			"between text"
		);
	});

	test( "URL schemes", function( assert ) {
		assert.propEqual(
			parseString( "https://google.com" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://google.com", text: "google.com" } ]
			},
			"Remove https protocol from link text"
		);
		assert.propEqual(
			parseString( "google.com" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://google.com", text: "google.com" } ]
			},
			"Implicit https protocol"
		);
	});

	test( "URL netlocs", function( assert ) {
		assert.propEqual(
			parseString( "cat.jpg" ),
			{
				texts: [ "cat.jpg" ],
				links: []
			},
			"Invalid TLD"
		);

		assert.propEqual(
			parseString( "google.de" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://google.de", text: "google.de" } ]
			},
			"country code domains"
		);
		assert.propEqual(
			parseString( "google.co.uk" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://google.co.uk", text: "google.co.uk" } ]
			},
			"second level domains"
		);
		assert.propEqual(
			parseString( "foo.我爱你" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.我爱你", text: "foo.我爱你" } ]
			},
			"internationalized TLDs"
		);
		assert.propEqual(
			parseString( "foo.xn--7ba0bs.xn--6QQ986B3XL" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.xn--7ba0bs.xn--6QQ986B3XL", text: "foo.ÄÖÜ.我爱你" } ]
			},
			"internationalized domains"
		);

		assert.propEqual(
			parseString( "www.google.com" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://www.google.com", text: "www.google.com" } ]
			},
			"subdomains"
		);
		assert.propEqual(
			parseString( "foo.bar.baz.com" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.bar.baz.com", text: "foo.bar.baz.com" } ]
			},
			"multiple subdomains"
		);

		assert.deepEqual(
			parseString( "foo.com:8080" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.com:8080", text: "foo.com:8080" } ]
			},
			"port number"
		);
	});

	test( "URL paths", function( assert ) {
		assert.propEqual(
			parseString( "foo.com/" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.com/", text: "foo.com/" } ]
			},
			"empty path"
		);
		assert.propEqual(
			parseString( "foo.com/bar" ),
			{
				texts: [ "", "" ],
				links: [ { url : "https://foo.com/bar", text: "foo.com/bar" } ]
			},
			"non-empty path"
		);

		assert.propEqual(
			parseString( "<https://foo.com/>" ),
			{
				texts: [ "<", "" ],
				links: [ { url: "https://foo.com/>", text: "foo.com/>" } ]
			},
			"empty path with URL wrappers"
		);
		assert.propEqual(
			parseString( "<https://foo.com/bar>" ),
			{
				texts: [ "<", "" ],
				links: [ { url: "https://foo.com/bar>", text: "foo.com/bar>" } ]
			},
			"non-empty path with URL wrappers"
		);

		assert.propEqual(
			parseString( "foo.com:8080/bar" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://foo.com:8080/bar", text: "foo.com:8080/bar" } ]
			},
			"port number"
		);
	});

	test( "URLs misc", function( assert ) {
		assert.propEqual(
			parseString( "GOOGLE.COM" ),
			{
				texts: [ "", "" ],
				links: [ { url : "https://GOOGLE.COM", text: "GOOGLE.COM" } ]
			},
			"Ignore case"
		);
		assert.propEqual(
			parseString( "sub.host.com/path/subpath?a=b&c#d" ),
			{
				texts: [ "", "" ],
				links: [{
					url : "https://sub.host.com/path/subpath?a=b&c#d",
					text: "sub.host.com/path/subpath?a=b&c#d"
				}]
			},
			"Path + query + hash"
		);
		assert.propEqual(
			parseString( "foo bar.com baz.com qux.com quux" ),
			{
				texts: [ "foo ", " ", " ", " quux" ],
				links: [
					{ url: "https://bar.com", text: "bar.com" },
					{ url: "https://baz.com", text: "baz.com" },
					{ url: "https://qux.com", text: "qux.com" }
				]
			},
			"Multiple matches"
		);
	});

	test( "Twitter", function( assert ) {
		assert.propEqual(
			parseString( "@foo" ),
			{
				texts: [ "", "" ],
				links: [ { url: "https://twitter.com/foo", text: "@foo" } ]
			},
			"Simple test"
		);

		assert.propEqual(
			parseString( "name@mail.com" ),
			{
				texts: [ "name@mail.com" ],
				links: []
			},
			"Email test"
		);

		assert.propEqual(
			parseString( "!@foo..." ),
			{
				texts: [ "!", "..." ],
				links: [ { url: "https://twitter.com/foo", text: "@foo" } ]
			},
			"Special char boundaries"
		);

		assert.propEqual(
			parseString( "@myusernameiswaytoolongfortwitter" ),
			{
				texts: [ "@myusernameiswaytoolongfortwitter" ],
				links: []
			},
			"Username length"
		);

		assert.propEqual(
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
		assert.propEqual(
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

		assert.propEqual(
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

		assert.propEqual(
			parseString( "https://www.reddit.com https://www.reddit.com/r/subreddit/comments/abcdef" ),
			{
				texts: [ "", " ", "" ],
				links: [
					{
						url: "https://www.reddit.com",
						text: "www.reddit.com"
					},
					{
						url: "https://www.reddit.com/r/subreddit/comments/abcdef",
						text: "www.reddit.com/r/subreddit/comments/abcdef"
					}
				]
			},
			"Non-matching subreddit links"
		);
	});

	test( "Reddit user", function( assert ) {
		assert.propEqual(
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

		assert.propEqual(
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

		assert.propEqual(
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
		assert.propEqual(
			parseString( "Follow @foo and visit bar.com or follow /u/baz and visit /r/qux" ),
			{
				texts: [ "Follow ", " and visit ", " or follow ", " and visit ", "" ],
				links: [
					{ url: "https://twitter.com/foo", text: "@foo" },
					{ url: "https://bar.com", text: "bar.com" },
					{ url: "https://www.reddit.com/u/baz", text: "/u/baz" },
					{ url: "https://www.reddit.com/r/qux", text: "/r/qux" }
				]
			},
			"Multiple matches"
		);
	});
});
