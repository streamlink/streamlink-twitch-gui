import Component from "@ember/component";
import { get, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { langs } from "config";
import "./styles.less";


export default Component.extend({
	i18n: service(),

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

		const i18n = get( this, "i18n" );
		const type = get( this, "type" );
		const langId = get( this, "lang" );
		const path = `languages.${langId}`;

		if ( type !== "channel" && type !== "broadcaster" || !i18n.exists( path ) ) {
			return "";
		}

		return i18n.t( `components.flag-icon.${type}`, {
			lang: i18n.t( path ).toString()
		}).toString();
	})
});
