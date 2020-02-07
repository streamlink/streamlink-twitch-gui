import Component from "@ember/component";
import { computed } from "@ember/object";
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
		const code = langs[ this.lang ];

		return code
			? `flag-${code.flag}`
			: null;
	}),

	title: computed( "withTitle", "lang", function() {
		if ( !this.withTitle ) {
			return "";
		}

		const { i18n, type, lang: langId } = this;
		const path = `languages.${langId}`;
		if ( type !== "channel" && type !== "broadcaster" || !i18n.exists( path ) ) {
			return "";
		}

		const lang = i18n.t( path ).toString();

		return type === "channel"
			? i18n.t( "components.flag-icon.channel", { lang } ).toString()
			: i18n.t( "components.flag-icon.broadcaster", { lang } ).toString();
	})
});
