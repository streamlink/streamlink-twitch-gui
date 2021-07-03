import { A } from "@ember/array";
import { default as EmberObject, get } from "@ember/object";
import Evented from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { Menu, MenuItem } from "nwjs/nwGui";


export default EmberObject.extend( Evented, {
	/** @type {IntlService} */
	intl: service(),

	init() {
		this.menu = new Menu({
			type: this.type || "contextmenu"
		});

		this.items = A();
		this.items.addArrayObserver( this, {
			willChange: this._itemsWillChange,
			didChange : this._itemsDidChange
		});
	},

	rebuild() {
		const length = get( this.items, "length" );
		this._itemsWillChange( this.items, 0, length, 0 );
		this._itemsDidChange( this.items, 0, 0, length );
	},


	_itemsWillChange( observedObj, start, removeCount/*, addCount*/ ) {
		const menu = this.menu;
		for ( ; removeCount > 0; removeCount-- ) {
			menu.removeAt( start );
		}
	},

	_itemsDidChange( observedObj, start, removeCount, addCount ) {
		const menu = this.menu;
		for ( const end = start + addCount; start < end; start++ ) {
			const item = this._createMenuItem( this.intl, observedObj[ start ] );
			menu.insert( item, start );
		}

		this.trigger( "update" );
	},

	/**
	 * @param {IntlService} intl
	 * @param {Object} obj
	 * @return {module:"nw.gui".MenuItem}
	 * @private
	 */
	_createMenuItem( intl, obj ) {
		const data = Object.assign( {}, obj );

		if ( !data.type ) {
			data.type = "normal";
		}
		if ( data.enabled === undefined ) {
			data.enabled = true;
		}
		if ( data.label ) {
			data.label = intl.t( ...data.label );
		}
		if ( data.tooltip ) {
			data.tooltip = intl.t( ...data.tooltip );
		}

		if ( data.submenu ) {
			const submenu = new Menu();
			data.submenu.forEach( submenuObj => {
				const submenuItem = this._createMenuItem( intl, submenuObj );
				submenu.append( submenuItem );
			});
			data.submenu = submenu;
		}

		delete data.click;
		const item = new MenuItem( data );
		if ( obj.click ) {
			item.click = ( ...args ) => obj.click( item, this, ...args );
		}

		return item;
	}
});
