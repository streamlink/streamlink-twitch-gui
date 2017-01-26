import {
	Service
} from "Ember";


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
 * @property {(Function|String)} action
 */

class HotkeyRegistry {
	/**
	 * @param {Component} context
	 * @param {Hotkey[]} hotkeys
	 */
	constructor( context, hotkeys ) {
		/** @type {Component} */
		this.context = context;
		/** @type {Hotkey[]} */
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
		let registry = new HotkeyRegistry( context, hotkeys );
		this.registries.unshift( registry );
	},

	/**
	 * Remove all hotkeys registered by a component
	 * @param {Component} context
	 */
	unregister( context ) {
		let registry = this.registries.findBy( "context", context );
		if ( !registry ) { return; }
		this.registries.removeObject( registry );
	},

	/**
	 * Find a registered hotkey that matches and execute the action of the one added last
	 * @param {KeyboardEvent} event
	 */
	trigger( event ) {
		if ( ignoreElements.some( element => event.target instanceof element ) ) {
			return;
		}

		/** @type {KeyboardEvent} */
		let e = event.originalEvent || event;
		/** @type {Component} */
		let context;
		/** @type {(Function|String)} */
		let action;

		let found = this.registries.some( registry => {
			let hotkey = registry.hotkeys.find( h =>
				   ( isArray( h.code ) ? h.code.indexOf( e.code ) !== -1 : h.code === e.code )
				&& ( h.altKey === undefined || h.altKey === e.altKey )
				&& ( h.ctrlKey === undefined || h.ctrlKey === e.ctrlKey )
				&& ( h.shiftKey === undefined || h.shiftKey === e.shiftKey )
			);

			if ( hotkey ) {
				context = registry.context;
				action = hotkey.action;
				return true;
			}
		});

		if ( !found ) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		if ( typeof action === "string" ) {
			context.send( action );

		} else if ( action instanceof Function ) {
			action.call( context );

		} else {
			throw new Error( "Invalid hotkey action" );
		}
	}
});
