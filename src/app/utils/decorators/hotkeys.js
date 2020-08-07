import { isDescriptor } from "./is-descriptor";


/**
 * @param {Object} target The prototype of the class implementing the hotkey
 * @param {string} key The hotkey's action name
 * @param {PropertyDescriptor} descriptor
 * @param {Function} descriptor.value The hotkey's action callback
 * @return {undefined}
 */
function setupHotkey( target, key, descriptor ) {
	// make sure hotkeys property exists on prototype
	if ( !Object.prototype.hasOwnProperty.call( target, "hotkeys" ) ) {
		// and merge it with the parent class's hotkeys
		const parentClass = Object.getPrototypeOf( target );
		target.hotkeys = Object.assign( {}, parentClass.hotkeys );
	}

	// add new hotkey action callback
	target.hotkeys[ key ] = descriptor.value;
}


/**
 * Moves the hotkey action callback to the prototype.hotkeys object, and creates it, if it doesn't
 * exist yet. Return value is always undefined, as the callback should not exist on the class's
 * prototype itself. In case of naming conflicts, custom action names can be set.
 * @param {string?} customAction Set a custom hotkey action name
 * @return {(undefined|function(Object, string, PropertyDescriptor): undefined)}
 */
export function hotkey( customAction ) {
	if ( isDescriptor( ...arguments ) ) {
		return setupHotkey( ...arguments );
	}

	return function( target, key, descriptor ) {
		return setupHotkey( target, customAction || key, descriptor );
	};
}


/**
 * @param {string} namespace
 * @returns {function(Object): undefined}
 */
export function hotkeysNamespace( namespace ) {
	return cls => {
		const parentNamespace = Object.getPrototypeOf( cls.prototype ).hotkeysNamespace || [];
		cls.prototype.hotkeysNamespace = [ ...parentNamespace, namespace ];
	};
}
