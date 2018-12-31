import { KEYBOARD_EVENT_TYPES } from "@ember/test-helpers/dom/fire-event";
import { triggerEvent } from "./trigger-event";


const DEFAULT_MODIFIERS = Object.freeze({
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	metaKey: false
});

// This is not a comprehensive list, but it is better than nothing.
const keyFromKeyCode = {
	8: "Backspace",
	9: "Tab",
	13: "Enter",
	16: "Shift",
	17: "Control",
	18: "Alt",
	20: "CapsLock",
	27: "Escape",
	32: " ",
	37: "ArrowLeft",
	38: "ArrowUp",
	39: "ArrowRight",
	40: "ArrowDown",
	48: "0",
	49: "1",
	50: "2",
	51: "3",
	52: "4",
	53: "5",
	54: "6",
	55: "7",
	56: "8",
	57: "9",
	65: "a",
	66: "b",
	67: "c",
	68: "d",
	69: "e",
	70: "f",
	71: "g",
	72: "h",
	73: "i",
	74: "j",
	75: "k",
	76: "l",
	77: "m",
	78: "n",
	79: "o",
	80: "p",
	81: "q",
	82: "r",
	83: "s",
	84: "t",
	85: "u",
	86: "v",
	87: "v",
	88: "x",
	89: "y",
	90: "z",
	91: "Meta",
	93: "Meta", // There is two keys that map to meta,
	187: "=",
	189: "-"
};
const keys = Object.keys( keyFromKeyCode );


/**
 * Infers the keycode from the given key
 * @param {string} key The KeyboardEvent#key string
 * @returns {number} The keycode for the given key
 */
function keyCodeFromKey( key ) {
	let keyCode = keys.find( keyCode => keyFromKeyCode[ keyCode ] === key );
	if ( !keyCode ) {
		const keyLC = key.toLowerCase();
		keyCode = keys.find( keyCode => keyFromKeyCode[ keyCode ] === keyLC );
	}

	return parseInt( keyCode );
}


/**
 * Triggers a keyboard event of given type in the target element.
 * Based on @ember/test-helpers, but uses jQuery for now
 *
 * @param {string|Element} target the element or selector to trigger the event on
 * @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
 * @param {number|string} key the `key`(string) of the event being triggered
 * @param {Object} [modifiers]
 * @param {boolean} [modifiers.ctrlKey=false]
 * @param {boolean} [modifiers.altKey=false]
 * @param {boolean} [modifiers.shiftKey=false]
 * @param {boolean} [modifiers.metaKey=false]
 * @return {Promise<Event>}
 */
export async function triggerKeyEvent( target, eventType, key, modifiers = DEFAULT_MODIFIERS ) {
	if ( KEYBOARD_EVENT_TYPES.indexOf( eventType ) === -1 ) {
		throw new Error( "Invalid key event type" );
	}
	if ( typeof key !== "string" || !key.length ) {
		throw new Error( "Must provide a `key` to `triggerKeyEvent`" );
	}

	const keyCode = keyCodeFromKey( key );
	const props = { key, keyCode, which: keyCode };
	const options = Object.assign( props, modifiers );

	return await triggerEvent( target, eventType, options );
}

export async function triggerKeyDownEvent( target, key, modifiers ) {
	return await triggerKeyEvent( target, "keydown", key, modifiers );
}
