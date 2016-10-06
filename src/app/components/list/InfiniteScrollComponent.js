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


const { alias, or } = computed;
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
		"locked:disabled"
	],

	scrollThreshold: 2 / 3,
	scrollListener : null,

	type: "button",
	locked: or( "isFetching", "hasFetchedAll" ),
	error: alias( "_targetObject.fetchError" ),

	isFetching: alias( "_targetObject.isFetching" ),
	hasFetchedAll: alias( "_targetObject.hasFetchedAll" ),

	click() {
		// FIXME: targetObject
		var targetObject = get( this, "_targetObject" );
		targetObject.send( "willFetchContent", true );
	},


	_contentLength: 0,
	// check for available space (scrollListener) if items were removed from the content array
	_contentObserver: observer( "content.length", function() {
		var length = get( this, "content.length" );
		if ( length >= this._contentLength ) { return; }
		this._contentLength = length;

		var scrollListener = get( this, "scrollListener" );
		if ( !scrollListener ) { return; }
		// wait for the DOM to upgrade
		scheduleOnce( "afterRender", scrollListener );
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
		let threshold = get( this, "scrollThreshold" );
		// FIXME: targetObject
		let target    = get( this, "_targetObject" );
		let listener  = this.infiniteScroll.bind( this, parent, threshold, target );

		set( this, "$parent", $parent );
		set( this, "scrollListener", listener );

		$parent.on( "scroll", listener );
		$window.on( "resize", listener );
	},


	willDestroyElement() {
		this._super( ...arguments );

		var $parent = get( this, "$parent" );
		var scrollListener = get( this, "scrollListener" );
		$parent.off( "scroll", scrollListener );
		$window.off( "resize", scrollListener );
		set( this, "$parent", null );
		set( this, "scrollListener", null );
	},


	infiniteScroll( elem, percentage, target ) {
		var threshold = percentage * elem.clientHeight;
		var remaining = elem.scrollHeight - elem.clientHeight - elem.scrollTop;
		if ( remaining <= threshold ) {
			target.send( "willFetchContent" );
		}
	}
});
