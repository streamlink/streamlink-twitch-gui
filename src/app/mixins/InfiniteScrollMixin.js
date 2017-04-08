import {
	get,
	set,
	defineProperty,
	computed,
	Mixin
} from "Ember";


const CSSMediaRule = window.CSSMediaRule;
const CSSStyleRule = window.CSSStyleRule;
// lessCSS sorts media queries alphabetically, so we need to reverse the order here
const reMinWidth = /^(?:\(max-width:\s*\d+px\)\s*and\s*)?\(min-width:\s*(\d+)px\)$/;
const cachedMinWidths = {};

const styleSheetsRules = [ ...document.styleSheets ].reduce( ( rules, stylesheet ) => {
	rules.push( ...stylesheet.rules );
	return rules;
}, [] );

const cssMinWidthRules = styleSheetsRules
	.filter( rule =>
		   rule instanceof CSSMediaRule
		&& rule.media.length === 1
		&& reMinWidth.test( rule.media[ 0 ] )
		&& rule.cssRules.length > 0
	);
const cachedMinHeights = styleSheetsRules
	.filter( rule =>
		   rule instanceof CSSStyleRule
		&& rule.style.minHeight !== ""
	)
	.reduce( ( cache, rule ) => {
		rule.selectorText.split( "," ).forEach( selector => {
			cache[ selector.trim() ] = parseInt( rule.style.minHeight, 10 );
		});
		return cache;
	}, {} );

/**
 * Generate a list of all min-width media queries and their item widths for a specific selector.
 * These media queries have been defined by the lesscss function .dynamic-elems-per-row()
 */
function readMinWidths( selector ) {
	if ( cachedMinWidths.hasOwnProperty( selector ) ) {
		return cachedMinWidths[ selector ];
	}

	let data = cssMinWidthRules.filter( rule => rule.cssRules[ 0 ].selectorText === selector );

	if ( !data.length ) {
		throw new Error( "Invalid selector" );
	}

	data = data.map( rule => ({
		minWidth: Math.floor( reMinWidth.exec( rule.media[0] )[1] ),
		numItems: Math.floor( 100 / parseInt( rule.cssRules[0].style.width ) )
	}) );

	return ( cachedMinWidths[ selector ] = data );
}

function readMinHeights( selector ) {
	if ( !cachedMinHeights.hasOwnProperty( selector ) ) {
		throw new Error( "Invalid selector" );
	}
	return cachedMinHeights[ selector ];
}

function getNeededColumns( selector ) {
	return readMinWidths( selector )
		.reduce( ( current, next ) => window.innerWidth < next.minWidth
			? current
			: next
		)
		.numItems;
}

function getNeededRows( selector ) {
	const minHeight = readMinHeights( selector );
	return 1 + Math.ceil( getItemContainer().clientHeight / minHeight );
}

function getItemContainer() {
	// the route's view hasn't been inserted yet: choose the parent element
	return document.querySelector( "body > .wrapper" )
	    || document.body;
}


export default Mixin.create({
	/**
	 * Define the content array location.
	 * Can't use a binding here!!!
	 */
	contentPath: "controller.model",

	/**
	 * Fetch offset
	 */
	offset: 0,
	filteredOffset: 0,

	/**
	 * Don't fetch infinitely.
	 */
	maxAutoFetches: 3,

	/**
	 * Set by Twitch
	 */
	maxLimit: 100,

	/**
	 * This is actually an ugly concept, but we need to set this data at the route, so we can
	 * control the fetch size before querying the data. The fetch size depends on the
	 * window size and css media queries containing this selector. We can't move this
	 * calculation to the view or to the controller, because they both aren't set up at the
	 * time where the size is being calculated...
	 */
	itemSelector: "",


	/**
	 * Calculate how many items are needed to completely fill the container
	 */
	calcFetchSize() {
		const itemSel = get( this, "itemSelector" );
		const offset = get( this, "offset" );
		const max = get( this, "maxLimit" );
		const columns = getNeededColumns( itemSel );
		const rows = getNeededRows( itemSel );
		const uneven = offset % columns;

		// fetch size + number of items to fill the last row after a window resize
		const limit = ( columns * rows ) + ( uneven > 0 ? columns - uneven : 0 );

		set( this, "limit", Math.min( limit, max ) );
	},


	beforeModel() {
		this._super( ...arguments );

		// reset offset value
		set( this, "offset", 0 );
		set( this, "filteredOffset", 0 );
		this.calcFetchSize();
	},

	setupController( controller, model ) {
		this._super( ...arguments );

		// offset (current model length)
		// setup oneWay computed property to the value of `contentPath`
		const contentPath = get( this, "contentPath" );
		const path = `${contentPath}.length`;
		const computedOffset = computed( path, "filteredOffset", () => {
			// increase model length by number of filtered records
			return get( this, path ) + get( this, "filteredOffset" );
		});
		defineProperty( this, "offset", computedOffset );


		const offset = get( this, "offset" );
		const limit  = get( this, "limit" );

		set( controller, "isFetching", false );
		set( controller, "hasFetchedAll", offset < limit );
		set( controller, "initialFetchSize", model.length );
	},

	fetchContent() {
		return this.model();
	},

	filterFetchedContent( key, value ) {
		return records => {
			const filtered = key instanceof Function
				? records.filter( key )
				: records.filterBy( key, value );

			const recordsLength = get( records, "length" );
			const filteredLength = get( filtered, "length" );
			const diff = recordsLength - filteredLength;

			// add to filteredOffset, so that next requests don't include the filtered records
			this.incrementProperty( "filteredOffset", diff );
			// reduce limit, so that the hasFetchedAll calculation keeps working
			this.decrementProperty( "limit", diff );

			return filtered;
		};
	},

	actions: {
		willTransition() {
			// offset: remove oneWay computed property and set value to 0
			defineProperty( this, "offset", {
				writable    : true,
				configurable: true,
				enumerable  : true,
				value       : 0
			});
			return true;
		},

		willFetchContent( force ) {
			const controller = get( this, "controller" );
			const isFetching = get( controller, "isFetching" );
			const fetchedAll = get( controller, "hasFetchedAll" );

			// we're already busy or finished fetching
			if ( isFetching || fetchedAll ) { return; }

			this.calcFetchSize();

			const content = get( this, get( this, "contentPath" ) );
			const offset = get( this, "offset" );
			const limit = get( this, "limit" );
			const max = get( this, "maxAutoFetches" );
			const num = offset / limit;

			// don't fetch infinitely
			if ( !force && num > max ) { return; }

			set( controller, "fetchError", false );
			set( controller, "isFetching", true );

			// fetch content
			this.fetchContent()
				.then( data => {
					// read limit again (in case it was modified by a filtered model)
					let limit = get( this, "limit" );
					if ( !data || !data.length || data.length < limit ) {
						set( controller, "hasFetchedAll", true );
					}
					if ( data && data.length ) {
						content.pushObjects( data );
					}
				})
				.catch( err => {
					set( controller, "fetchError", true );
					set( controller, "hasFetchedAll", false );
					return Promise.reject( err );
				})
				.finally( () => {
					set( controller, "isFetching", false );
				});
		}
	}
});
