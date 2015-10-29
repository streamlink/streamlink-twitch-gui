define([
	"Ember",
	"utils/linkparser",
	"hbs!templates/components/EmbeddedLinksComponent"
], function(
	Ember,
	linkparser,
	layout
) {

	var get = Ember.get;
	var parseString = linkparser.parseString;

	return Ember.Component.extend({
		layout: layout,

		content: function() {
			var text   = get( this, "text" );
			var parsed = parseString( text );
			var links  = parsed.links;

			// merge texts and links
			return parsed.texts.reduce(function( output, textItem, index ) {
				if ( textItem.length ) {
					output.push({ text: textItem });
				}
				if ( links[ index ] ) {
					output.push( links[ index ] );
				}
				return output;
			}, [] );
		}.property( "text" )
	});

});
