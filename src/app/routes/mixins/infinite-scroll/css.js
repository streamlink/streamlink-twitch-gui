import { window } from "nwjs/Window";


const defaultContainerSelector = "body > .wrapper";

const {
	document,
	CSSMediaRule,
	CSSStyleRule
} = window;

const { hasOwnProperty } = {};

const {
	ceil,
	floor
} = Math;


// lessCSS sorts media queries alphabetically, so we need to reverse the order here
const reMinWidth = /^(?:\(max-width:\s*\d+px\)\s*and\s*)?\(min-width:\s*(\d+)px\)$/;
const cachedMinWidths = {};


const cssRules = [ ...document.styleSheets ]
	.reduce( ( rules, stylesheet ) => {
		rules.push( ...stylesheet.rules );
		return rules;
	}, [] );


export const cssMinWidthRules = cssRules
	.filter( rule =>
		   rule instanceof CSSMediaRule
		&& rule.media.length === 1
		&& reMinWidth.test( rule.media[ 0 ] )
		&& rule.cssRules.length > 0
	);

export const cachedMinHeights = cssRules
	.filter( rule =>
		   rule instanceof CSSStyleRule
		&& rule.style.minHeight !== ""
	)
	.reduce( ( cache, rule ) => {
		const height = parseInt( rule.style.minHeight, 10 );
		rule.selectorText.split( "," ).forEach( selector => {
			cache[ selector.trim() ] = height;
		});
		return cache;
	}, {} );


export function getNeededColumns( selector, width = window.innerWidth ) {
	let cache;

	if ( hasOwnProperty.call( cachedMinWidths, selector ) ) {
		cache = cachedMinWidths[ selector ];

	} else {
		/*
		 * Get a list of all min-width media queries and their item widths for a specific selector.
		 * These media queries have been defined by the lesscss function .dynamic-elems-per-row()
		 */
		const data = cssMinWidthRules
			.filter( rule => rule.cssRules[ 0 ].selectorText === selector );

		if ( !data.length ) {
			throw new Error( "Invalid selector" );
		}

		cache = cachedMinWidths[ selector ] = data.map( rule => ({
			minWidth: floor( reMinWidth.exec( rule.media[ 0 ] )[ 1 ] ),
			numItems: floor( 100 / parseInt( rule.cssRules[ 0 ].style.width, 10 ) )
		}) );
	}

	return cache
		.reduce( ( current, next ) => width < next.minWidth ? current : next )
		.numItems;
}

export function getNeededRows( selector, containerSelector = defaultContainerSelector ) {
	if ( !hasOwnProperty.call( cachedMinHeights, selector ) ) {
		throw new Error( "Invalid selector" );
	}

	const minHeight = cachedMinHeights[ selector ];

	// the route's view hasn't been inserted yet: choose the parent element
	const container = document.querySelector( containerSelector ) || document.body;

	return 1 + ceil( container.clientHeight / minHeight );
}
