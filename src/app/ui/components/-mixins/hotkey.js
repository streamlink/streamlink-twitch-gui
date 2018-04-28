import { get, computed } from "@ember/object";
import { on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import formatTitle from "services/hotkey/title";


const { isArray } = Array;


export default Mixin.create({
	i18n: service(),
	hotkey: service(),

	concatenatedProperties: "hotkeys",
	disableHotkeys: false,

	title: computed( "_title", function() {
		const title = get( this, "_title" );

		if (
			   !title
			|| !isArray( this.hotkeys )
			|| !this.hotkeys.length
			|| get( this, "disableHotkeys" )
		) {
			return title;
		}

		const i18n = get( this, "i18n" );
		const hotkey = this.hotkeys[ 0 ];

		return formatTitle( i18n, title, hotkey );
	}),

	_registerHotkeys: on( "didInsertElement", function() {
		if ( get( this, "disableHotkeys" ) ) { return; }

		const HotkeyService = get( this, "hotkey" );
		const hotkeys = get( this, "hotkeys" ) || [];

		if ( !hotkeys.length ) { return; }

		// reverse the array (concatenatedProperties appends similar hotkeys defined by subclasses)
		HotkeyService.register( this, hotkeys.slice().reverse() );
	}),

	_unregisterHotkeys: on( "willDestroyElement", function() {
		const HotkeyService = get( this, "hotkey" );

		HotkeyService.unregister( this );
	})
});
