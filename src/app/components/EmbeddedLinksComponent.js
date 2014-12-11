define( [ "ember", "utils/linkmatching" ], function( Ember, linkmatching ) {

	var	hbs_string	= "%@"
			+ "{{#external-link"
			+ " url='%@'"
			+ " targetObject=targetObject}}"
			+ "%@"
			+ "{{/external-link}}",

		linkurl_re	= linkmatching.linkurl_re,
		linkurl_fn	= linkmatching.linkurl_fn( hbs_string ),
		twitter_re	= linkmatching.twitter_re,
		twitter_fn	= linkmatching.twitter_fn( hbs_string );


	return Ember.Component.extend({
		layout: function( context ) {
			return Ember.Handlebars.compile(
				Ember.get( context, "_text" )
			).apply( this, arguments );
		},

		_text: function() {
			return ( this.get( "text" ) || "" )
				.replace( linkurl_re, linkurl_fn )
				.replace( twitter_re, twitter_fn );
		}.property( "text" ),

		textChangeObserver: function() {
			this.rerender();
		}.observes( "text" )
	});

});
