import {
	EmberObject,
	Evented
} from "Ember";
import {
	Menu,
	MenuItem
} from "nwjs/nwGui";


export default EmberObject.extend( Evented, {
	type : "contextmenu",
	menu : null,
	items: null,

	init() {
		this.menu = new Menu({
			type: this.type
		});

		if ( !this.items ) {
			this.items = [];
		} else {
			this._itemsDidChange( this.items, 0, 0, this.items.length );
		}

		this.items.addArrayObserver( this, {
			willChange: this._itemsWillChange,
			didChange : this._itemsDidChange
		});
	},

	popup( event ) {
		event.preventDefault();
		event.stopImmediatePropagation();

		this.menu.popup( event.originalEvent.x, event.originalEvent.y );
	},

	createMacBuiltin( appname, hideEdit, hideWindow ) {
		this.menu.createMacBuiltin( appname, {
			hideEdit  : !!hideEdit,
			hideWindow: !!hideWindow
		});
	},


	_itemsWillChange( observedObj, start, removeCount/*, addCount*/ ) {
		// remove old menuitems
		for ( var menu = this.menu, end = start + removeCount; start < end; start++ ) {
			menu.removeAt( start );
		}
	},

	_itemsDidChange( observedObj, start, removeCount, addCount ) {
		// add new menuitems
		for ( var menu = this.menu, end = start + addCount, item; start < end; start++ ) {
			item = this._createMenuItem( observedObj[ start ] );
			menu.insert( item, start );
		}

		this.trigger( "update" );
	},

	_createMenuItem( obj ) {
		var data = {
			type   : obj.type || "normal",
			enabled: obj.enabled === undefined
				? true
				: obj.enabled,
			label  : obj.label,
			tooltip: obj.tooltip || "",
			checked: obj.checked
		};

		if ( obj.submenu ) {
			data.submenu = new Menu();
			obj.submenu.forEach(function( submenuObj ) {
				var submenuItem = this._createMenuItem( submenuObj );
				data.submenu.append( submenuItem );
			}, this );
		}

		var item = new MenuItem( data );
		if ( obj.click ) {
			item.click = obj.click.bind( null, item, this );
		}

		return item;
	}
});
