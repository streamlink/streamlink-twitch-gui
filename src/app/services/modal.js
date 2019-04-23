import { A } from "@ember/array";
import { getOwner } from "@ember/application";
import { setProperties } from "@ember/object";
import { notEmpty } from "@ember/object/computed";
import Evented from "@ember/object/evented";
import Service from "@ember/service";


/**
 * @typedef {Object} ModalServiceEntry
 * @property {string} name
 * @property {Object} context
 * @property {number} priority
 */


export default class ModalService extends Service.extend( Evented ) {
	/** @type {ModalServiceEntry[]} */
	modals = A();

	@notEmpty( "modals" )
	isModalOpened;

	/**
	 * @param {string} name
	 * @param {Object?} context
	 * @param {Object?} data
	 * @param {number?} priority
	 * @returns {Object} context
	 */
	openModal( name, context = null, data = null, priority ) {
		if ( !getOwner( this ).hasRegistration( `component:modal-${name}` ) ) {
			throw new Error( `Modal component 'modal-${name}' does not exist` );
		}

		context = context || {};
		priority <<= 0;

		if ( typeof context !== "object" ) {
			throw new Error( "Missing context object" );
		}

		if ( data ) {
			setProperties( context, data );
		}

		const { modals } = this;
		const idx = modals.findIndex( ({ name: n, context: c }) => n === name && c === context );
		let pos = modals.findIndex( ({ priority: p }) => p > priority );
		if ( pos === -1 ) {
			pos = modals.length;
		}

		// create new modal dialog
		if ( idx === -1 ) {
			modals.insertAt( pos, { name, context, priority } );
			this.trigger( "open", name, context, priority );

		} else {
			const obj = modals.objectAt( idx );
			obj.priority = priority;

			// set new position of existing modal dialog only if a different priority justifies it
			if ( idx !== pos ) {
				modals.removeAt( idx );
				if ( pos > idx ) {
					--pos;
				}
				modals.insertAt( pos, obj );
			}
		}

		return context;
	}

	/**
	 * @param {(Object|null)} context
	 * @param {(string|null)} name
	 */
	closeModal( context = null, name = null ) {
		const { modals } = this;
		for ( let i = modals.length - 1; i >= 0; i-- ) {
			const { name: n, context: c } = modals.objectAt( i );

			if (
				// match by context, optionally with name
				   c === context && ( !name || n === name )
				// match only by name
				|| !context && n === name
			) {
				modals.removeAt( i );
				this.trigger( "close", n, c );
			}
		}
	}

	promiseModal( name, context, ...args ) {
		return new Promise( resolve => {
			const onClose = ( n, c ) => {
				if ( n !== name || c !== context ) { return; }
				this.off( "close", onClose );
				resolve();
			};
			this.on( "close", onClose );
			context = this.openModal( name, context, ...args );
		});
	}

	/**
	 * @param {string?} name
	 * @param {Object?} context
	 * @return {boolean}
	 */
	hasModal( name, context ) {
		return !!this.modals.find( ({ name: n, context: c }) =>
			// match by context, optionally with name
			   c === context && ( !name || n === name )
			// match only by name
			|| !context && n === name
		);
	}
}
