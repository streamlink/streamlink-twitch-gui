import Component from "@ember/component";
import { get, set, observer } from "@ember/object";
import { or } from "@ember/object/computed";
import { scheduleOnce } from "@ember/runloop";
import layout from "./template.hbs";
import "./styles.less";


export default Component.extend({
	layout,

	tagName: "button",
	classNames: [
		"infinite-scroll-component",
		"form-button-component",
		"icon-and-text"
	],
	classNameBindings: [
		"hasFetchedAll:hidden"
	],
	attributeBindings: [
		"type",
		"isLocked:disabled"
	],

	threshold: 2 / 3,
	_listener: null,

	type: "button",
	isLocked: or( "isFetching", "hasFetchedAll" ),

	click() {
		if ( !get( this, "isLocked" ) ) {
			get( this, "action" )( true );
		}
	},


	_contentLength: 0,
	// check for available space if items were removed from the content array
	_contentObserver: observer( "content.length", function() {
		const length = get( this, "content.length" );
		if ( length >= this._contentLength ) { return; }
		this._contentLength = length;

		const listener = get( this, "_listener" );
		if ( !listener ) { return; }
		// wait for the DOM to upgrade
		scheduleOnce( "afterRender", listener );
	}),


	init() {
		this._super( ...arguments );

		if ( get( this, "content" ) ) {
			this._contentLength = get( this, "content.length" );
		}
	},


	didInsertElement() {
		this._super( ...arguments );

		const element = this.element;
		const document = element.ownerDocument;
		const body = document.body;
		const documentElement = document.documentElement;

		// find first parent node which has a scroll bar
		let parent = element;
		while ( ( parent = parent.parentNode ) ) {
			// stop at the document body
			if ( parent === body || parent === documentElement ) {
				parent = documentElement.querySelector( "main.content" ) || body;
				break;
			}
			// the current element's clientHeight needs to be smaller than its scrollHeight
			if ( parent.clientHeight >= parent.scrollHeight ) {
				continue;
			}
			// finally check the overflow-y css property if a scroll bar is available
			const overflow = getComputedStyle( parent, "" ).getPropertyValue( "overflow-y" );
			if ( overflow === "scroll" || overflow === "auto" ) {
				break;
			}
		}

		const action = get( this, "action" );
		const threshold = get( this, "threshold" );
		const { infiniteScroll } = this;
		const listener = () => {
			if ( infiniteScroll( parent, threshold ) ) {
				action( false );
			}
		};

		// use Ember.set here, so that these properties can be properly bound in the component test
		set( this, "_parent", parent );
		set( this, "_listener", listener );

		parent.addEventListener( "scroll", listener );
		document.defaultView.addEventListener( "resize", listener );
	},


	willDestroyElement() {
		this._super( ...arguments );

		const listener = this._listener;
		this._parent.removeEventListener( "scroll", listener );
		this.element.ownerDocument.defaultView.removeEventListener( "resize", listener );
		set( this, "_parent", null );
		set( this, "_listener", null );
	},


	infiniteScroll( elem, percentage ) {
		const threshold = percentage * elem.clientHeight;
		const remaining = elem.scrollHeight - elem.clientHeight - elem.scrollTop;

		return remaining <= threshold;
	}
});
