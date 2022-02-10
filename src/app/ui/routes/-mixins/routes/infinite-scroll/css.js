import { window } from "nwjs/Window";


const { ceil, floor } = Math;
const { document, CSSMediaRule, CSSStyleRule } = window;

const defaultContainerSelector = "body > .wrapper";

// eslint-disable-next-line max-len
const reMinWidth = /^(?:\(max-width:\s*\d+px\)\s*and\s*)?\(min-width:\s*(\d+)px\)(?:\s*and\s*\(max-width:\s*\d+px\))?$/;


/** @type {(CSSMediaRule|CSSStyleRule)[]} */
const cssRules = [];

/** @typedef {{minWidth: number, numItems: number}} MinWidthItem */
/** @type {Map<string, MinWidthItem[]>} */
const cachedMinWidths = new Map();
/** @type {Map<string, number>} */
const cachedMinHeights = new Map();


/**
 * @return {CSSStyleRule[]}
 */
function findCssRules() {
	if ( !cssRules.length ) {
		for ( const stylesheet of document.styleSheets ) {
			cssRules.push( ...Array.from( stylesheet.cssRules )
				.filter( rule => rule instanceof CSSMediaRule || rule instanceof CSSStyleRule )
			);
		}
	}

	return cssRules;
}


/**
 * @return {Map<string, MinWidthItem[]>}
 */
export function getCachedMinWidths() {
	if ( !cachedMinWidths.size ) {
		for ( const cssMediaRule of findCssRules() ) {
			if (
				   !( cssMediaRule instanceof CSSMediaRule )
				|| cssMediaRule.media.length !== 1
				|| !reMinWidth.test( cssMediaRule.media[ 0 ] )
				|| !cssMediaRule.cssRules.length
			) {
				continue;
			}

			const firstCssRule = cssMediaRule.cssRules.item( 0 );
			const firstMediaQuery = cssMediaRule.media.item( 0 );

			const selector = firstCssRule.selectorText;
			let minWidthItems = cachedMinWidths.get( selector );
			if ( !minWidthItems ) {
				minWidthItems = [];
				cachedMinWidths.set( selector, minWidthItems );
			}

			const minWidth = floor( reMinWidth.exec( firstMediaQuery )[ 1 ] );
			const numItems = floor( 100 / parseInt( firstCssRule.style.width, 10 ) );

			minWidthItems.push({ minWidth, numItems });
		}
	}

	return cachedMinWidths;
}

/**
 * @return {Map<string, number>}
 */
export function getCachedMinHeights() {
	if ( !cachedMinHeights.size ) {
		for ( const cssStyleRule of findCssRules() ) {
			if (
				   !( cssStyleRule instanceof CSSStyleRule )
				|| cssStyleRule.style.minHeight === ""
			) {
				continue;
			}

			const height = parseInt( cssStyleRule.style.minHeight, 10 );
			for ( const selector of cssStyleRule.selectorText.split( "," ) ) {
				cachedMinHeights.set( selector.trim(), height );
			}
		}
	}

	return cachedMinHeights;
}


/**
 * @param {string} selector
 * @param {number?} width
 * @return {number}
 */
export function getNeededColumns( selector, width = window.innerWidth ) {
	const minWidths = getCachedMinWidths();
	const minWidthItems = minWidths.get( selector );
	if ( !minWidthItems ) {
		throw new Error( `Can't calculate needed columns, invalid selector: ${selector}` );
	}

	return minWidthItems
		.reduce( ( current, next ) => width < next.minWidth ? current : next )
		.numItems;
}

/**
 * @param {string} selector
 * @param {string?} containerSelector
 * @return {number}
 */
export function getNeededRows( selector, containerSelector = defaultContainerSelector ) {
	const minHeights = getCachedMinHeights();
	const minHeight = minHeights.get( selector );
	if ( !minHeight ) {
		throw new Error( `Can't calculate needed rows, invalid selector: ${selector}` );
	}

	// the route's view hasn't been inserted yet: choose the parent element
	const container = document.querySelector( containerSelector ) || document.body;

	return 1 + ceil( container.clientHeight / minHeight );
}
