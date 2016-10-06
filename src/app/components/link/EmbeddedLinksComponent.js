import {
	get,
	computed,
	Component
} from "Ember";
import { parseString } from "utils/linkparser";
import layout from "templates/components/link/EmbeddedLinksComponent.hbs";


export default Component.extend({
	layout,

	content: computed( "text", function() {
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
	})
});
