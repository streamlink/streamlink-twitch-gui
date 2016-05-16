define([
	"Ember",
	"config"
], function(
	Ember,
	config
) {

	var get = Ember.get;

	var langs = config.langs;


	return Ember.Component.extend({
		tagName: "i",
		classNameBindings: [ ":flag-icon", "flag", "withCursor::flag-icon-no-cursor" ],
		attributeBindings: [ "title" ],

		lang: null,
		type: null,
		withTitle : true,
		withCursor: true,

		flag: function() {
			var lang  = get( this, "lang" );
			var code  = langs[ lang ];

			return code
				? "flag-icon-" + code.flag
				: null;
		}.property( "lang" ),

		title: function() {
			if ( !get( this, "withTitle" ) ) { return ""; }

			var lang  = get( this, "lang" );

			if ( !langs[ lang ] ) { return ""; }
			lang = langs[ lang ][ "lang" ];

			switch ( get( this, "type" ) ) {
				case "channel":
					return "The channel's language is " + lang;
				case "broadcaster":
					return "The broadcaster's language is " + lang;
				default:
					return "";
			}
		}.property( "withTitle", "lang" )
	});

});
