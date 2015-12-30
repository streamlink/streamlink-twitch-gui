define([
	"Ember",
	"nwjs/nwGui"
], function(
	Ember,
	nwGui
) {

	var Menu = nwGui.Menu;
	var MenuItem = nwGui.MenuItem;


	return Ember.Object.extend( Ember.Evented, {
		menu : null,
		items: null,

		init: function( type ) {
			this.menu = new Menu({
				type: type || "contextmenu"
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

		popup: function( x, y ) {
			this.menu.popup( x, y );
		},

		createMacBuiltin: function( appname, hideEdit, hideWindow ) {
			this.menu.createMacBuiltin( appname, {
				hideEdit  : !!hideEdit,
				hideWindow: !!hideWindow
			});
		},


		_itemsWillChange: function( observedObj, start, removeCount/*, addCount*/ ) {
			// remove old menuitems
			for ( var menu = this.menu, end = start + removeCount; start < end; start++ ) {
				menu.removeAt( start );
			}
		},

		_itemsDidChange: function( observedObj, start, removeCount, addCount ) {
			// add new menuitems
			for ( var menu = this.menu, end = start + addCount, obj, item; start < end; start++ ) {
				obj  = observedObj[ start ];
				item = new MenuItem({
					type   : obj.type || "normal",
					enabled: obj.enabled === undefined
						? true
						: obj.enabled,
					label  : obj.label,
					tooltip: obj.tooltip || "",
					checked: obj.checked
				});
				item.click = obj.click.bind( null, item, this );

				menu.insert( item, start );
			}

			this.trigger( "update" );
		}
	});

});
