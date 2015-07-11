define( [ "Ember" ], function( Ember ) {

	var get = Ember.get;
	var alias = Ember.computed.alias;

	return Ember.Component.extend({
		metadata: Ember.inject.service(),

		tagName: "i",
		classNameBindings: [ ":flag-icon", "flag" ],
		attributeBindings: [ "title" ],

		lang: null,
		type: null,

		codes: alias( "metadata.config.language_codes" ),

		flag: function() {
			var codes = get( this, "codes" );
			var lang  = get( this, "lang" );

			return codes[ lang ]
				? "flag-icon-%@".fmt( codes[ lang ][ "flag" ] )
				: null;
		}.property( "lang" ),

		title: function() {
			var codes = get( this, "codes" );
			var lang  = get( this, "lang" );

			if ( !codes[ lang ] ) { return; }
			lang = codes[ lang ][ "lang" ];

			switch ( get( this, "type" ) ) {
				case "channel":
					return "The channel's language is %@".fmt( lang );
				case "broadcaster":
					return "The broadcaster's language is %@".fmt( lang );
			}
		}.property( "lang" )
	});

});
