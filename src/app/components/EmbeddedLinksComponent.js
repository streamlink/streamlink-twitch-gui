define( [ "ember" ], function( Ember ) {

	var	hbs_string	= "%@"
			+ "{{#external-link"
			+ " url='%@'"
			+ " targetObject=targetObject}}"
			+ "%@"
			+ "{{/external-link}}",

		twitter_re	= new RegExp([
			// boundary (no look-behind)
			"(^|\\s)",
			// username
			"@([a-z0-9_]+)",
			// boundary
			"(?=[^a-z0-9_]|$)"
		].join( "" ), "igm" ),
		twitter_fn	= function( _, lookbehind, user ) {
			return hbs_string.fmt(
				lookbehind,
				"https://twitter.com/" + user,
				"@" + user
			);
		},

		linkurl_re	= new RegExp([
			// boundary (no look-behind)
			"(^|\\s)",
			// scheme (allow implicit http scheme)
			"((?:http|ftp)s?:\\/\\/|www\\.)",
			// user:pass@sub.host.tld:port
			"((?:\\w+(?::\\w+)?@)?(?:[a-z0-9\u00C0-\uFFFF-]+\\.)*[a-z]+(?::\\d{2,5})?)",
			// path
			"(\/\\S*)?",
			// boundary
			"(?=\\s|$)"
		].join( "" ), "igm" ),
		linkurl_fn	= function( _, lookbehind, scheme, host, path ) {
			var url = "%@%@%@".fmt( scheme, host, path );
			return hbs_string.fmt(
				lookbehind,
				( scheme === "www." ? "http://" : "" ) + url,
				url
			);
		};


	return Ember.Component.extend({
		layout: function( context ) {
			return Ember.Handlebars.compile(
				Ember.get( context, "_text" )
			).apply( this, arguments );
		},

		_text: function() {
			return this.get( "text" )
				.replace( twitter_re, twitter_fn )
				.replace( linkurl_re, linkurl_fn );
		}.property( "text" )
	});

});
