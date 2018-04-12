import Helper from "@ember/component/helper";
import { get, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import formatTitle from "services/hotkey/title";


export const helper = Helper.extend({
	i18n: service(),

	compute( [ keyTitle, hotkey ], properties ) {
		const i18n = get( this, "i18n" );
		const title = i18n.t( keyTitle, properties ).toString();

		return formatTitle( i18n, title, hotkey );
	},

	_localeObserver: observer( "i18n.locale", function() {
		this.recompute();
	})
});
