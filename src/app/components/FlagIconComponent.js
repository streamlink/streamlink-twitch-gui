define( [ "ember" ], function( Ember ) {

	var get = Ember.get;

	return Ember.Component.extend({
		tagName: "i",
		classNameBindings: [ ":flag-icon", "flag" ],
		attributeBindings: [ "title" ],

		lang: null,
		type: null,

		codes: function() {
			return get(
				this.container.lookup( "controller:application" ),
				"metadata.package.config.language_codes"
			);
		}.property(),

		flag: function() {
			var	codes = get( this, "codes" ),
				lang = get( this, "lang" );
			return codes[ lang ]
				? "flag-icon-%@".fmt( codes[ lang ][ "flag" ] )
				: null;
		}.property( "lang" ),

		title: function() {
			var	codes = get( this, "codes" ),
				lang = get( this, "lang" );
			if ( !codes[ lang ] ) { return; }
			lang = codes[ lang ][ "lang" ];
			switch ( get( this, "type" ) ) {
				case "channel":
					return "This channel is %@".fmt( lang );
				case "broadcaster":
					return "The broadcaster's language is %@".fmt( lang );
			}
		}.property( "lang" )
	});

});
