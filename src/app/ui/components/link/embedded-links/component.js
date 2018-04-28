import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { parseString } from "utils/linkparser";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	classNames: [ "embedded-links-component" ],

	content: computed( "text", function() {
		const text = get( this, "text" );
		const parsed = parseString( text );
		const links = parsed.links;

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
