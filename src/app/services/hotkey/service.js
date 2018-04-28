import Service from "@ember/service";


const { isArray } = Array;

const ignoreElements = [
	HTMLInputElement,
	HTMLSelectElement,
	HTMLTextAreaElement
];


/**
 * @typedef {Object} Hotkey
 * @property {(String|String[])} code
 * @property {Boolean?} altKey
 * @property {Boolean?} ctrlKey
 * @property {Boolean?} shiftKey
 * @property {Boolean?} force
 * @property {(Function|String)} action
 */

class HotkeyRegistry {
	/**
	 * @param {Component} context
	 * @param {Hotkey[]} hotkeys
	 */
	constructor( context, hotkeys ) {
		this.context = context;
		this.hotkeys = hotkeys;
	}
}


/**
 * @class HotkeyService
 */
export default Service.extend({
	/**
	 * @type {HotkeyRegistry[]}
	 */
	registries: [],

	/**
	 * Register hotkeys of a component
	 * @param {Component} context
	 * @param {Hotkey[]} hotkeys
	 */
	register( context, hotkeys ) {
		const registry = new HotkeyRegistry( context, hotkeys );
		this.registries.unshift( registry );
	},

	/**
	 * Remove all hotkeys registered by a component
	 * @param {Component} context
	 */
	unregister( context ) {
		const registry = this.registries.findBy( "context", context );
		if ( !registry ) { return; }
		this.registries.removeObject( registry );
	},

	/**
	 * Find a registered hotkey that matches and execute the action of the one added last
	 * @param {(KeyboardEvent|jQuery.Event)} event
	 * @param {Number?} start
	 */
	trigger( event, start = 0 ) {
		const { registries } = this;
		const { length } = registries;

		if ( start >= length ) {
			return;
		}

		/** @type {KeyboardEvent} */
		const e = event.originalEvent || event;
		/** @type {Component} */
		let context;
		/** @type {Hotkey} */
		let hotkey;

		// find the first matching hotkey
		for ( ; start < length; start++ ) {
			let registry = registries[ start ];
			hotkey = registry.hotkeys.find( h =>
				   ( isArray( h.code ) ? h.code.indexOf( e.code ) !== -1 : h.code === e.code )
				&& ( h.altKey === undefined || h.altKey === e.altKey )
				&& ( h.ctrlKey === undefined || h.ctrlKey === e.ctrlKey )
				&& ( h.shiftKey === undefined || h.shiftKey === e.shiftKey )
			);

			if ( hotkey ) {
				context = registry.context;
				break;
			}
		}

		// no registered hotkey matched the keyboard event
		if ( start === length ) {
			return;
		}

		// an ignored element is focused and the hotkey is not forced
		if ( !hotkey.force && ignoreElements.some( element => event.target instanceof element ) ) {
			return;
		}

		// execute action
		const { action } = hotkey;
		let result;

		if ( typeof action === "string" ) {
			context.send( action );

		} else if ( action instanceof Function ) {
			result = action.call( context );
		}

		// bubble event
		if ( result === true ) {
			this.trigger( event, start + 1 );
		} else {
			// stop default behavior
			event.preventDefault();
			event.stopImmediatePropagation();
		}
	}
});
