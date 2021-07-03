import { getOwner } from "@ember/application";
import { getProperties } from "@ember/object";
import { default as Service, inject as service } from "@ember/service";
import { hotkeys as hotkeysConfig } from "config";


const { hasOwnProperty } = {};


const ignoreElements = [
	HTMLInputElement,
	HTMLSelectElement,
	HTMLTextAreaElement
];


/**
 * @typedef {Ember.Component} HotkeyComponent
 * @property {boolean} hotkeysDisabled
 * @property {string[]} hotkeysNamespace
 * @property {Object<string,Function>} hotkeys
 * @property {(string|null)} hotkeysTitleAction
 */

/**
 * @typedef {Map<string,HotkeysMapItem>} HotkeysMap
 */

/**
 * @typedef {(Hotkey|Object)} Hotkeylike
 */

/**
 * @class Hotkey
 * @property {boolean} disabled
 * @property {(string|null)} code
 * @property {boolean} altKey
 * @property {boolean} ctrlKey
 * @property {boolean} metaKey
 * @property {boolean} shiftKey
 * @property {boolean} force
 */
class Hotkey {
	/** @param {Hotkeylike} hotkey */
	constructor( hotkey = {} ) {
		this._fix( hotkey );
		this.disabled = false;
		this.force = !!hotkey.force;
	}

	/** @param {Hotkeylike} hotkey */
	_fix( hotkey ) {
		this.code = hotkey.code || null;
		this.altKey = !!hotkey.altKey;
		this.ctrlKey = !!hotkey.ctrlKey;
		this.metaKey = !!hotkey.metaKey;
		this.shiftKey = !!hotkey.shiftKey;
	}

	/** @param {Hotkeylike} hotkey */
	merge( hotkey = {} ) {
		this.disabled = !!hotkey.disabled;
		if ( hotkey.code ) {
			this._fix( hotkey );
		}
	}
}

/**
 * @class {Array<Hotkey>} HotkeysMapItem
 * @property {string?} alias
 */
class HotkeysMapItem extends Array {
	/**
	 * @param {Hotkey[]} hotkeys
	 * @param {string?} alias
	 */
	constructor( hotkeys, alias ) {
		super();
		// make sure that we've always got two hotkeys
		if ( hotkeys.length !== 2 ) {
			hotkeys.push( undefined, undefined );
			hotkeys.splice( 2 );
		}
		this.push( ...hotkeys.map( h => new Hotkey( h ) ) );
		this.alias = alias;
	}

	/** @param {Hotkeylike[]} hotkeys */
	update( hotkeys ) {
		hotkeys.forEach( ( h, i ) => this[ i ].merge( h ) );
	}
}

/**
 * @param {(Hotkey[]|string)} hotkeys
 * @returns {(undefined|[Hotkey[],(string|undefined)])}
 */
function resolveHotkeyAlias( hotkeys ) {
	const aliases = [];
	while ( typeof hotkeys === "string" ) {
		if ( aliases.includes( hotkeys ) ) { return; }
		aliases.push( hotkeys );

		const sep = hotkeys.indexOf( "." );
		const namespace = hotkeys.substr( 0, sep );
		const action = hotkeys.substr( sep + 1 );

		if ( !hasOwnProperty.call( hotkeysConfig, namespace ) ) { return; }
		const { actions } = hotkeysConfig[ namespace ];
		if ( !hasOwnProperty.call( actions, action ) ) { return; }

		hotkeys = actions[ action ];
	}

	return [ hotkeys.slice(), aliases.pop() ];
}

/**
 * @params {HotkeysMap} map
 * @params {Object<string,Object<string,HotkeyUser[]>>?} userData
 */
function hotkeysMapBuild( map, userData ) {
	// always iterate the hotkeysConfig, even if building the user data, to make sure that
	// invalid user data does not pollute the hotkey map
	for ( const [ namespace, { actions } ] of Object.entries( hotkeysConfig ) ) {
		for ( const [ action, hotkeys ] of Object.entries( actions ) ) {
			const id = `${namespace}.${action}`;

			// initialize with default and empty user data
			// also resolve hotkey aliases
			const resolvedHotkeys = resolveHotkeyAlias( hotkeys );
			if ( !resolvedHotkeys ) { continue; }
			const [ defaultHotkeys, alias ] = resolvedHotkeys;
			const item = new HotkeysMapItem( defaultHotkeys, alias );
			map.set( id, item );

			// update with user data
			if (
				   userData
				&& hasOwnProperty.call( userData, namespace )
				&& hasOwnProperty.call( userData[ namespace ], action )
			) {
				const { primary, secondary } = userData[ namespace ][ action ];
				item.update([ primary, secondary ]);
			}
		}
	}

	// update user data of aliased hotkeys after everything has been resolved
	if ( userData ) {
		for ( const item of map.values() ) {
			if ( !item.alias ) { continue; }
			item.update( map.get( item.alias ) );
		}
	}
}


/**
 * @param {KeyboardEvent} event
 * @param {Hotkey} hotkey
 */
function matchHotkey( event, hotkey ) {
	return hotkey.code === event.code
	    && hotkey.altKey === event.altKey
	    && hotkey.ctrlKey === event.ctrlKey
	    && hotkey.metaKey === event.metaKey
	    && hotkey.shiftKey === event.shiftKey;
}

/**
 * @param {KeyboardEvent} event
 * @param {boolean} force
 * @param {HotkeyComponent} context
 * @param {(Function|string)} callback
 * @returns {boolean}
 */
function trigger( event, force, context, callback ) {
	// an ignored element is focused and the hotkey is not forced
	if ( !force && ignoreElements.some( e => event.target instanceof e ) ) {
		return false;
	}

	let result;
	if ( typeof callback === "string" ) {
		context.send( callback );
	} else {
		// can't ignore else on an else if block with current istanbuljs version :(
		/* istanbul ignore else */
		if ( callback instanceof Function ) {
			result = callback.call( context, event );
		}
	}

	// don't bubble event if result is not true
	// neither on the HotkeyService, nor the native event system
	if ( result !== true ) {
		event.preventDefault();
		event.stopImmediatePropagation();
		return false;
	}

	return true;
}


/**
 * @property {string} id
 * @property {HotkeyComponent} context
 * @property {(Function|string)} callback
 */
class HotkeyRegistry {
	constructor( id, context, callback ) {
		this.id = id;
		this.context = context;
		this.callback = callback;
	}
}


/**
 * @class HotkeyService
 */
export default Service.extend({
	/** @type {IntlService} */
	intl: service(),
	/** @type {SettingsService} */
	settings: service(),

	init() {
		this._super( ...arguments );

		this.registries = [];
		this.hotkeys = new Map();
		hotkeysMapBuild( this.hotkeys );
		const hotkeysMapUpdate = () => {
			const userData = this.settings.content && this.settings.content.hotkeys;
			/* istanbul ignore else */
			if ( userData ) {
				// always rebuild hotkey map when user data changes
				this.hotkeys.clear();
				hotkeysMapBuild( this.hotkeys, userData.toJSON() );
			}
		};
		this.settings.one( "initialized", hotkeysMapUpdate );
		this.settings.on( "didUpdate", hotkeysMapUpdate );

		// Even though the KeyboardMap API is currently only a proposed API by the WICG and has
		// not been standardized yet by the W3C, it is already partially implemented in Chromium.
		// Only the reference US keyboard layout is currently used and the `layoutchange` event
		// is still missing.
		// Once Chromium adds support for other layouts, the KeyboardEvent.code mapping to localized
		// key names, which this API provides, should work seamlessly.
		// https://wicg.github.io/keyboard-map/
		// https://chromestatus.com/feature/6730004075380736

		// see keyboard-layout-map application initializer
		// (promise needs to be resolved before application boot)
		const owner = getOwner( this );
		this.layoutMap = owner.lookup( "keyboardlayoutmap:main" );
		owner.unregister( "keyboardlayoutmap:main" );

		const resetLayoutMap = async () => this.layoutMap = await navigator.keyboard.getLayoutMap();
		//navigator.keyboard.addEventListener( "layoutchange", resetLayoutMap );
		this.settings.on( "didUpdate", resetLayoutMap );
	},

	/** @type {HotkeysMap} */
	hotkeys: null,

	/** @type {HotkeyRegistry[]} */
	registries: null,

	/** @type {KeyboardLayoutMap} */
	layoutMap: null,

	/**
	 * Register hotkeys of a component
	 * @param {HotkeyComponent} context
	 */
	register( context ) {
		const { hotkeysNamespace = [], hotkeys = {}, hotkeysDisabled: disabled } = context;
		if ( disabled || !hotkeysNamespace.length || !Object.keys( hotkeys ).length ) { return; }

		// the top-most namespace must be the first one
		const namespaces = hotkeysNamespace.slice().reverse();
		const registries = [];

		// iterate over all actions...
		for ( const [ action, callback ] of Object.entries( hotkeys ) ) {
			// ...and find the first hotkey namespace where the current action exists
			for ( const namespace of namespaces ) {
				if (
					   hasOwnProperty.call( hotkeysConfig, namespace )
					&& hasOwnProperty.call( hotkeysConfig[ namespace ].actions, action )
				) {
					const id = `${namespace}.${action}`;
					const registry = new HotkeyRegistry( id, context, callback );
					registries.push( registry );
					break;
				}
			}
		}

		this.registries.unshift( ...registries );
	},

	/**
	 * Remove all hotkeys registered by a component
	 * @param {HotkeyComponent} context
	 */
	unregister( context ) {
		const { registries } = this;
		for ( let i = 0, l = registries.length; i < l; i++ ) {
			if ( registries[ i ].context === context ) {
				registries.splice( i, 1 );
				i--;
				l--;
			}
		}
	},

	/**
	 * Find a registered hotkey that matches and execute the action of the one added last
	 * @param {KeyboardEvent} event
	 */
	trigger( event ) {
		const { hotkeys } = this;

		// find matching hotkey registry
		for ( const { id, context, callback } of this.registries ) {
			// check custom hotkeys first
			for ( const hotkey of hotkeys.get( id ) ) {
				// the hotkey must be enabled and it has to match
				if ( hotkey.disabled || !hotkey.code || !matchHotkey( event, hotkey ) ) {
					continue;
				}
				// execute action and see whether it should bubble
				if ( !trigger( event, hotkey.force, context, callback ) ) {
					// don't bubble
					return;
				}
				// let the action bubble to the next registry item
				break;
			}
		}
	},

	/**
	 * @param {string} namespace
	 * @param {string} action
	 * @returns {(Hotkey|undefined)}
	 */
	getHotkeyData( namespace, action ) {
		const id = `${namespace}.${action}`;
		const { hotkeys } = this;

		return hotkeys.has( id )
		    && hotkeys.get( id ).find( hotkey => !hotkey.disabled && hotkey.code !== null );
	},

	/**
	 * @param {HotkeyComponent} context
	 * @param {string?} action
	 * @returns {(Hotkey|undefined)}
	 */
	getHotkeyDataByContext( context, action ) {
		for ( const namespace of context.hotkeysNamespace.slice().reverse() ) {
			const hotkey = this.getHotkeyData( namespace, action );
			if ( hotkey ) {
				return hotkey;
			}
		}
	},

	/**
	 * @param {Hotkey} hotkey
	 * @param {string} title
	 * @returns {string}
	 */
	formatTitle( hotkey, title ) {
		const { intl, layoutMap } = this;
		const combination = [];

		// use Ember.get here, because hotkey can be an ObjectProxy wrapping a hotkey record
		const { code, altKey, ctrlKey, metaKey, shiftKey }
			= getProperties( hotkey, "code", "altKey", "ctrlKey", "metaKey", "shiftKey" );

		ctrlKey && combination.push( intl.t( "hotkeys.modifiers.ctrlKey" ).toString() );
		shiftKey && combination.push( intl.t( "hotkeys.modifiers.shiftKey" ).toString() );
		metaKey && combination.push( intl.t( "hotkeys.modifiers.metaKey" ).toString() );
		altKey && combination.push( intl.t( "hotkeys.modifiers.altKey" ).toString() );

		// look for translations of special hotkeys, eg. "Space"
		combination.push( intl.exists( `hotkeys.codes.${code}` )
			? intl.t( `hotkeys.codes.${code}` ).toString()
			: layoutMap.has( code )
				? layoutMap.get( code ).toUpperCase()
				: code
		);

		const str = combination.join( "+" );

		return title
			? `[${str}] ${title}`
			: str;
	}
});
