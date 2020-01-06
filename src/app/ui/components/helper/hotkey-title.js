import Helper from "@ember/component/helper";
import { inject as service } from "@ember/service";


export const helper = Helper.extend({
	/** @type {HotkeyService} */
	hotkey: service(),
	/** @type {I18nService} */
	i18n: service(),

	init() {
		this._super( ...arguments );
		// initialize computed property of injected service to make the observer work
		this.get( "i18n" );
		this.addObserver( "i18n.locale", this, "recompute" );
	},

	compute( positional, { hotkey, context, namespace, action, title } ) {
		if ( action ) {
			if ( context ) {
				hotkey = this.hotkey.getHotkeyDataByContext( context, action );
			} else if ( namespace ) {
				hotkey = this.hotkey.getHotkeyData( namespace, action );
			}
		}

		title = title ? String( title ) : "";

		return hotkey
			? this.hotkey.formatTitle( hotkey, title )
			: title;
	}
});
