import { A as EmberNativeArray } from "@ember/array";
import { default as EmberObject, get } from "@ember/object";
import Evented from "@ember/object/evented";
import { inject as service } from "@ember/service";
import { Menu, MenuItem } from "nwjs/nwGui";


export default EmberObject.extend( Evented, {
	i18n: service(),

	init() {
		this.menu = new Menu({
			type: this.type || "contextmenu"
		});

		this.items = new EmberNativeArray();
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
		const i18n = get( this, "i18n" );
		const menu = this.menu;
		for ( const end = start + addCount; start < end; start++ ) {
			const item = this._createMenuItem( i18n, observedObj[ start ] );
			menu.insert( item, start );
		}

		this.trigger( "update" );
	},

	_createMenuItem( i18n, obj ) {
		const data = Object.assign( {}, obj );

		if ( !data.type ) {
			data.type = "normal";
		}
		if ( data.enabled === undefined ) {
			data.enabled = true;
		}
		if ( data.label ) {
			data.label = i18n.t( ...data.label );
		}
		if ( data.tooltip ) {
			data.tooltip = i18n.t( ...data.tooltip );
		}

		if ( data.submenu ) {
			const submenu = new Menu();
			data.submenu.forEach( submenuObj => {
				const submenuItem = this._createMenuItem( i18n, submenuObj );
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
