import Component from "@ember/component";
import { set, setProperties, action } from "@ember/object";
import { scheduleOnce } from "@ember/runloop";
import { className, classNames, layout, tagName } from "@ember-decorators/component";
import { observes, on } from "@ember-decorators/object";
import template from "./template.hbs";


@layout( template )
@tagName( "ui" )
@classNames( "drop-down-list-component" )
export default class DropDownListComponent extends Component {
	@className
	class = "";
	@className
	expanded = false;
	@className( "expanded-upwards" )
	upwards = false;


	@observes( "expanded" )
	_expandedObserver() {
		// always remove click listener
		this._removeClickListener();

		if ( !this.expanded ) {
			return;
		}

		// DOM needs to update first before the element's size can be calculated
		scheduleOnce( "afterRender", () => this._calcExpansionDirection() );

		// register a click event listener on the document body that closes the drop-down-list
		this._clickListener = ({ target }) => {
			// ignore clicks on the DropDownComponent
			if ( !this.element.contains( target ) ) {
				setProperties( this, {
					expanded: false,
					upwards: false
				});
			}
		};
		this.element.ownerDocument.body.addEventListener( "click", this._clickListener );
	}

	@on( "willDestroyElement" )
	_removeClickListener() {
		// unregister click event listener
		if ( this._clickListener ) {
			this.element.ownerDocument.body.removeEventListener( "click", this._clickListener );
			this._clickListener = null;
		}
	}

	_calcExpansionDirection() {
		const element = this.element;
		const parent = element.parentElement;
		const parentHeight = parent.offsetParent.offsetHeight;
		const positionTop = parent.offsetTop;
		const { marginTop, marginBottom } = getComputedStyle( element );
		const listHeight = element.offsetHeight + parseInt( marginTop ) + parseInt( marginBottom );
		const isOverflowing = parentHeight - positionTop < listHeight;
		set( this, "upwards", isOverflowing );
	}


	@action
	change( item ) {
		if ( this.disabled ) { return; }
		setProperties( this, {
			expanded: false,
			selection: item
		});
	}
}
