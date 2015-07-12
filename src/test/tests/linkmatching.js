define([
	"Ember",
	"utils/linkmatching"
], function(
	Ember,
	linkmatching
) {

	var replacement = "%@'%@'%@";

	var linkurl_re  = linkmatching.linkurl_re;
	var linkurl_fn  = linkmatching.linkurl_fn( replacement );
	var twitter_re  = linkmatching.twitter_re;
	var twitter_fn  = linkmatching.twitter_fn( replacement );


	QUnit.module( "Link matching" );


	QUnit.test( "URL matching", function( assert ) {

		function _( text ) {
			return text.replace( linkurl_re, linkurl_fn );
		}

		assert.deepEqual(
			[
				// invalid starting boundary
				_( "foohttps://google.com" ),
				// invalid ending boundary
				_( "https://google.comfoo" )
			],
			[
				"foohttps://google.com",
				"https://google.comfoo"
			],
			"Invalid boundaries"
		);

		assert.deepEqual(
			[
				// just the url
				_( "https://google.com" ),
				// valid starting boundary
				_( "!https://google.com" ),
				// valid ending boundary (no path)
				_( "<https://google.com>" ),
				// valid ending boundary (with path, but user input mistake)
				_( "<https://google.com/>" ),
				_( "<https://google.com/search>" ),
				// between text
				_( "foo https://google.com bar" )
			],
			[
				"'https://google.com'https://google.com",
				"!'https://google.com'https://google.com",
				"<'https://google.com'https://google.com>",
				"<'https://google.com/>'https://google.com/>",
				"<'https://google.com/search>'https://google.com/search>",
				"foo 'https://google.com'https://google.com bar"
			],
			"Valid boundaries"
		);

		assert.equal(
			_( "http://google.com" ),
			"'http://google.com'google.com",
			"Remove http protocol from link text"
		);

		assert.deepEqual(
			[
				_( "google.com" ),
				_( "maps.google.com" ),
				_( "google.com/search" )
			],
			[
				"'http://google.com'google.com",
				"'http://maps.google.com'maps.google.com",
				"'http://google.com/search'google.com/search"
			],
			"Implicit protocol"
		);

		assert.deepEqual(
			[
				_( "google.de" ),
				_( "cat.jpg" )
			],
			[
				"'http://google.de'google.de",
				"cat.jpg"
			],
			"TLDs"
		);

		assert.equal(
			_( "http://sub.host.com/path/subpath?a=b&c#d" ),
			"'http://sub.host.com/path/subpath?a=b&c#d'sub.host.com/path/subpath?a=b&c#d",
			"Path + query + hash"
		);

		assert.equal(
			_( "foo http://foo.com bar http://foo.com baz" ),
			"foo 'http://foo.com'foo.com bar 'http://foo.com'foo.com baz",
			"Multiple matches"
		);

		assert.deepEqual(
			[
				_( "ftp://user@host.com/path" ),
				_( "ftp://user:pass@host.com/path" ),
				_( "user@host.com/path" ),
				_( "user:pass@host.com/path" )
			],
			[
				"'ftp://user@host.com/path'ftp://user@host.com/path",
				"'ftp://user:pass@host.com/path'ftp://user:pass@host.com/path",
				"'http://user@host.com/path'user@host.com/path",
				"'http://user:pass@host.com/path'user:pass@host.com/path"
			],
			"User and password"
		);

		assert.equal(
			_( "foo.com:8080" ),
			"'http://foo.com:8080'foo.com:8080",
			"Port number"
		);

	});


	QUnit.test( "Twitter username matching", function( assert ) {

		function _( text ) {
			return text.replace( twitter_re, twitter_fn );
		}

		assert.equal(
			_( "@foo" ),
			"'https://twitter.com/foo'@foo",
			"Simple test"
		);

		assert.equal(
			_( "name@mail.com" ),
			"name@mail.com",
			"Email test"
		);

		assert.equal(
			_( "!@foo..." ),
			"!'https://twitter.com/foo'@foo...",
			"Special char boundaries"
		);

		assert.deepEqual(
			_( "@myusernameiswaytoolongfortwitter" ),
			"@myusernameiswaytoolongfortwitter",
			"Username length"
		);

	});

});
