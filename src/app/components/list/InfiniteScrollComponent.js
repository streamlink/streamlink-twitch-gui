import {
	get,
	set,
	$,
	computed,
	run,
	observer,
	Component
} from "Ember";
import layout from "templates/components/list/InfiniteScrollComponent.hbs";


const { or } = computed;
const { scheduleOnce } = run;

const $window = $( window );


export default Component.extend({
	layout,

	tagName: "button",
	classNameBindings: [
		":btn",
		":btn-with-icon",
		":infinite-scroll-component",
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
		let length = get( this, "content.length" );
		if ( length >= this._contentLength ) { return; }
		this._contentLength = length;

		let listener = get( this, "listener" );
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

		let body = document.body;
		let documentElement = document.documentElement;

		// find first parent node which has a scroll bar
		let overflow;
		let parent = get( this, "element" );
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
			overflow = getComputedStyle( parent, "" ).getPropertyValue( "overflow-y" );
			if ( overflow === "scroll" || overflow === "auto" ) {
				break;
			}
		}

		let $parent   = $( parent );
		let action    = get( this, "action" );
		let threshold = get( this, "threshold" );
		let listener  = function() {
			if ( this.infiniteScroll( parent, threshold ) ) {
				action( false );
			}
		}.bind( this );

		set( this, "$parent", $parent );
		set( this, "listener", listener );

		$parent.on( "scroll", listener );
		$window.on( "resize", listener );
	},


	willDestroyElement() {
		this._super( ...arguments );

		let $parent = get( this, "$parent" );
		let listener = get( this, "listener" );
		$parent.off( "scroll", listener );
		$window.off( "resize", listener );
		set( this, "$parent", null );
		set( this, "listener", null );
	},


	infiniteScroll( elem, percentage ) {
		let threshold = percentage * elem.clientHeight;
		let remaining = elem.scrollHeight - elem.clientHeight - elem.scrollTop;

		return remaining <= threshold;
	}
});
