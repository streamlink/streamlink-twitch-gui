import Component from "@ember/component";
import { get, set, observer } from "@ember/object";
import { or } from "@ember/object/computed";
import { scheduleOnce } from "@ember/runloop";
import $ from "jquery";
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
	listener: null,

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

		const listener = get( this, "listener" );
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

		const $window = $( document.defaultView );
		const $parent = $( parent );
		const action = get( this, "action" );
		const threshold = get( this, "threshold" );
		const { infiniteScroll } = this;
		const listener = () => {
			if ( infiniteScroll( parent, threshold ) ) {
				action( false );
			}
		};

		set( this, "$parent", $parent );
		set( this, "listener", listener );

		$parent.on( "scroll", listener );
		$window.on( "resize", listener );
	},


	willDestroyElement() {
		this._super( ...arguments );

		const $window = $( this.element.ownerDocument.defaultView );
		const $parent = get( this, "$parent" );
		const listener = get( this, "listener" );
		$parent.off( "scroll", listener );
		$window.off( "resize", listener );
		set( this, "$parent", null );
		set( this, "listener", null );
	},


	infiniteScroll( elem, percentage ) {
		const threshold = percentage * elem.clientHeight;
		const remaining = elem.scrollHeight - elem.clientHeight - elem.scrollTop;

		return remaining <= threshold;
	}
});
