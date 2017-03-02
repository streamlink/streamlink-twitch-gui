import {
	get,
	set,
	inject,
	on,
	Mixin
} from "Ember";


const { isArray } = Array;
const { service } = inject;


const reName = /^Key/;
const nameMap = {
	"Escape": "Esc",
	"slash": "/"
};
const kNameMap = Object.keys( nameMap );


export default Mixin.create({
	hotkey: service(),

	concatenatedProperties: "hotkeys",
	disableHotkeys: false,

	init() {
		this._super( ...arguments );

		let title = get( this, "title" );
		if (
			   title
			&& isArray( this.hotkeys )
			&& this.hotkeys.length
			&& !get( this, "disableHotkeys" )
		) {
			let { code, altKey, ctrlKey, shiftKey } = this.hotkeys[ 0 ];

			let modifier = "";
			if ( ctrlKey ) {
				modifier += "Ctrl+";
			}
			if ( shiftKey ) {
				modifier += "Shift+";
			}
			if ( altKey ) {
				modifier += "Alt+";
			}

			if ( isArray( code ) ) {
				code = code[0];
			}
			let key = kNameMap.indexOf( code ) !== -1
				? nameMap[ code ]
				: code.replace( reName, "" );

			set( this, "title", `[${modifier}${key}] ${title}` );
		}
	},

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
