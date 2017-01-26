import {
	get,
	inject,
	on,
	Mixin
} from "Ember";


const { service } = inject;


export default Mixin.create({
	hotkey: service(),

	concatenatedProperties: "hotkeys",
	disableHotkeys: false,

	_registerHotkeys: on( "didInsertElement", function() {
		if ( get( this, "disableHotkeys" ) ) { return; }

		const HotkeyService = get( this, "hotkey" );
		const hotkeys = get( this, "hotkeys" ) || [];

		if ( !hotkeys.length ) { return; }

		// reverse the array (concatenatedProperties appends similar hotkeys defined by subclasses)
		HotkeyService.register( this, hotkeys.reverse() );
	}),

	_unregisterHotkeys: on( "willDestroyElement", function() {
		const HotkeyService = get( this, "hotkey" );

		HotkeyService.unregister( this );
	})
});
