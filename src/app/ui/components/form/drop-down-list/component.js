import Component from "@ember/component";
import { get, set, setProperties, observer } from "@ember/object";
import $ from "jquery";
import layout from "./template.hbs";


export default Component.extend({
	layout,

	tagName: "ul",
	classNames: [ "drop-down-list-component" ],
	classNameBindings: [
		"expanded:expanded",
		"upwards:expanded-upwards",
		"class"
	],

	expanded: false,
	upwards: false,


	didInsertElement() {
		this._$elem = this.$();
		this._$parent = this._$elem.parent();
		this._offsetParent = this._$parent.offsetParent().get( 0 );
		this._super( ...arguments );
	},

	willDestroyElement() {
		this._removeClickListener();
		this._$elem = this._$parent = this._offsetParent = null;
		this._super( ...arguments );
	},


	_expandedObserver: observer( "expanded", function() {
		// always remove click listener
		this._removeClickListener();

		if ( !get( this, "expanded" ) ) {
			return;
		}

		this._calcExpansionDirection();

		// register a click event listener on the document body that closes the drop-down-list
		this._clickListener = event => {
			// ignore clicks on the DropDownComponent
			const distance = $( event.target ).closest( this.element ).length;
			if ( !distance ) {
				set( this, "expanded", false );
			}
		};
		$( this.element.ownerDocument.body ).on( "click", this._clickListener );
	}),

	_removeClickListener() {
		// unregister click event listener
		if ( this._clickListener ) {
			$( this.element.ownerDocument.body ).off( "click", this._clickListener );
			this._clickListener = null;
		}
	},

	_calcExpansionDirection() {
		const parentHeight = this._offsetParent.offsetHeight;
		const positionTop = this._$parent.position().top;
		const listHeight = this._$elem.height();
		const isOverflowing = parentHeight - positionTop < listHeight;
		set( this, "upwards", isOverflowing );
	},


	actions: {
		change( item ) {
			if ( get( this, "disabled" ) ) { return; }
			setProperties( this, {
				expanded: false,
				selection: item
			});
		}
	}
});
