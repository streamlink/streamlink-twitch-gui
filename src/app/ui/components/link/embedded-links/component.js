import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNames, layout } from "@ember-decorators/component";
import { parseString } from "utils/linkparser";
import template from "./template.hbs";


@layout( template )
@classNames( "embedded-links-component" )
export default class EmbeddedLinksComponent extends Component {
	@computed( "text" )
	get content() {
		const parsed = parseString( this.text );
		const links = parsed.links;

		// merge texts and links
		return parsed.texts.reduce( ( output, textItem, index ) => {
			if ( textItem.length ) {
				output.push({ text: textItem });
			}
			if ( links[ index ] ) {
				output.push( links[ index ] );
			}
			return output;
		}, [] );
	}
}
