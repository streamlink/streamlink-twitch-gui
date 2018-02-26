import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { langs } from "config";


export default Component.extend({
	tagName: "i",
	classNames: [ "flag-icon-component" ],
	classNameBindings: [ "flag", "withCursor::no-cursor" ],
	attributeBindings: [ "title" ],

	lang: null,
	type: null,
	withTitle : true,
	withCursor: true,

	flag: computed( "lang", function() {
		const lang = get( this, "lang" );
		const code = langs[ lang ];

		return code
			? `flag-${code.flag}`
			: null;
	}),

	title: computed( "withTitle", "lang", function() {
		if ( !get( this, "withTitle" ) ) { return ""; }

		let lang = get( this, "lang" );

		if ( !langs[ lang ] ) { return ""; }
		lang = langs[ lang ][ "lang" ];

		switch ( get( this, "type" ) ) {
			case "channel":
				return `The channel's language is ${lang}`;
			case "broadcaster":
				return `The broadcaster's language is ${lang}`;
			default:
				return "";
		}
	})
});
