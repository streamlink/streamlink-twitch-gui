define( [ "ember", "utils/linkmatching" ], function( Ember, linkmatching ) {

	var hbs_string = [
		"%@",
		"{{#external-link",
		" url='%@'",
		" targetObject=targetObject}}",
		"%@",
		"{{/external-link}}"
	].join( "" );

	var reSafestringL = /</g;
	var reSafestringR = />/g;

	var linkurl_re = linkmatching.linkurl_re;
	var linkurl_fn = linkmatching.linkurl_fn( hbs_string );
	var twitter_re = linkmatching.twitter_re;
	var twitter_fn = linkmatching.twitter_fn( hbs_string );


	return Ember.Component.extend({
		layout: function() {
			var template = String( Ember.getWithDefault( this, "text", "" ) )
				.replace( reSafestringL, "&lt;" )
				.replace( reSafestringR, "&gt;" )
				.replace( linkurl_re, linkurl_fn )
				.replace( twitter_re, twitter_fn );

			return Ember.HTMLBars.compile( template );
		}.property( "text" ),

		textChangeObserver: function() {
			this.rerender();
		}.observes( "text" )
	});

});
