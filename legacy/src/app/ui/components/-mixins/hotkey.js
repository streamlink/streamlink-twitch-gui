import { computed } from "@ember/object";
import { on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";


export default Mixin.create({
	/** @type {IntlService} */
	intl: service(),
	/** @type {HotkeyService} */
	hotkey: service(),

	concatenatedProperties: "hotkeysNamespace",
	mergedProperties: "hotkeys",

	hotkeysDisabled: false,
	hotkeysTitleAction: null,

	init() {
		this._super( ...arguments );
		// initialize computed property of injected service to make the observer work
		this.get( "intl" );
	},

	title: computed( "_title", "hotkeysDisabled", "hotkeysTitleAction", "intl.locale", function() {
		const _title = this._title;
		const title = _title ? String( _title ) : "";

		if ( !title || this.hotkeysDisabled || !this.hotkeysNamespace || !this.hotkeys ) {
			return title;
		}

		const action = this.hotkeysTitleAction || Object.keys( this.hotkeys )[ 0 ];
		const hotkey = this.hotkey.getHotkeyDataByContext( this, action );

		return hotkey
			? this.hotkey.formatTitle( hotkey, title )
			: title;
	}),

	_hotkeysRegister: on( "didInsertElement", function() {
		this.hotkey.register( this );
	}),

	_hotkeysUnregister: on( "willDestroyElement", function() {
		this.hotkey.unregister( this );
	})
});
