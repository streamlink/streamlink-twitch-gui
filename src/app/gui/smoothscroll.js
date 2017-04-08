/*!
 * SmoothScroll v1.2.1
 * https://github.com/galambalazs/smoothscroll
 * Licensed under the terms of the MIT license.
 *
 * People involved
 * - Balazs Galambosi (maintainer)
 * - Patrick Brunner  (original idea)
 * - Michael Herf     (Pulse Algorithm)
 *
 * modified by Sebastian Meyer
 */
import { isLinux } from "utils/node/platform";


const options = {
	animationTime: 400,
	stepSize: 120,

	pulseAlgorithm: true,
	pulseScale: 4,
	pulseNormalize: 1,

	accelerationDelta: 20,
	accelerationMax: 1,

	arrowScroll: 50
};

let enabled = false;


const direction = {
	x: 0,
	y: 0
};
const key = {
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	spacebar: 32,
	pageup: 33,
	pagedown: 34,
	end: 35,
	home: 36
};

const icon = document.createElement( "i" );
icon.classList.add( "fa" );
icon.classList.add( "fa-arrows-alt" );
icon.classList.add( "middleclick-scroll-icon" );

let isMiddleClickScrolling = false;


/************************************************
 * SCROLLING
 ************************************************/
let queue = [];
let pending = false;
let lastScroll = +new Date();

/**
 * Pushes scroll actions to the scrolling queue.
 */
function scrollArray( elem, left, top ) {
	directionCheck( left, top );

	if ( options.accelerationMax !== 1 ) {
		const now = +new Date();
		const elapsed = now - lastScroll;
		if ( elapsed < options.accelerationDelta ) {
			let factor = ( 1 + ( 30 / elapsed ) ) / 2;
			if ( factor > 1 ) {
				factor = Math.min( factor, options.accelerationMax );
				left *= factor;
				top  *= factor;
			}
		}
		lastScroll = +new Date();
	}

	// push a scroll command
	queue.push({
		x    : left,
		y    : top,
		lastX: left < 0 ? 0.99 : -0.99,
		lastY: top  < 0 ? 0.99 : -0.99,
		start: +new Date()
	});

	// don't act if there's a pending queue
	if ( pending ) {
		return;
	}

	const scrollWindow = elem === document.body;

	function step() {
		const now = +new Date();
		let scrollX = 0;
		let scrollY = 0;

		for ( let i = 0; i < queue.length; i++ ) {
			const item = queue[ i ];
			const elapsed = now - item.start;
			const finished = elapsed >= options.animationTime;

			// scroll position: [0, 1]
			let position = finished
				? 1
				: elapsed / options.animationTime;

			// easing [optional]
			if ( options.pulseAlgorithm ) {
				position = pulse( position );
			}

			// only need the difference
			const x = ( item.x * position - item.lastX ) >> 0;
			const y = ( item.y * position - item.lastY ) >> 0;

			// add this to the total scrolling
			scrollX += x;
			scrollY += y;

			// update last values
			item.lastX += x;
			item.lastY += y;

			// delete and step back if it's over
			if ( finished ) {
				queue.splice( i, 1 );
				i--;
			}
		}

		// scroll left and top
		if ( scrollWindow ) {
			window.scrollBy( scrollX, scrollY );

		} else if ( elem ) {
			if ( scrollX ) { elem.scrollLeft += scrollX; }
			if ( scrollY ) { elem.scrollTop  += scrollY; }
		}

		// clean up if there's nothing left to do
		if ( !left && !top ) {
			queue = [];
		}

		if ( queue.length ) {
			requestAnimationFrame( step );
		} else {
			pending = false;
		}
	}

	// start a new queue of actions
	requestAnimationFrame( step );
	pending = true;
}


/***********************************************
 * EVENTS
 ***********************************************/

/**
 * Mouse wheel handler.
 * @param {MouseEvent} event
 */
function onMousewheel( event ) {
	if ( event.defaultPrevented ) {
		return;
	}

	const target = event.target;
	let overflowing = overflowingAncestor( target );

	// use default if there's no overflowing element
	if ( !overflowing ) {
		return true;
	}

	let deltaX = event.wheelDeltaX || 0;
	let deltaY = event.wheelDeltaY || 0;

	// use wheelDelta if deltaX/Y is not available
	if ( !deltaX && !deltaY ) {
		deltaY = event.wheelDelta || 0;
	}

	// scale by step size
	// delta is 120 most of the time
	// synaptics seems to send 1 sometimes
	if ( Math.abs( deltaX ) > 1.2 ) {
		deltaX *= options.stepSize / 120;
	}
	if ( Math.abs( deltaY ) > 1.2 ) {
		deltaY *= options.stepSize / 120;
	}

	scrollArray( overflowing, -deltaX, -deltaY );
	event.preventDefault();
}

/**
 * Keydown event handler.
 * @param {KeyboardEvent} event
 */
function onKeydown( event ) {
	const target = event.target;
	const modifier = event.ctrlKey
		|| event.altKey
		|| event.metaKey
		|| event.shiftKey && event.keyCode !== key.spacebar;

	if (
		// do nothing if using a modifier key (except shift)
		// or user is editing text
		// or in a dropdown
		   modifier
		|| event.defaultPrevented
		|| target.isContentEditable
		|| /INPUT|TEXTAREA|SELECT/.test( target.tagName )
		// spacebar should trigger button press
		|| target.tagName === "BUTTON" && event.keyCode === key.spacebar
	) {
		return true;
	}

	let damt;
	let x = 0;
	let y = 0;
	let elem = document.querySelector( "main.content" );
	let clientHeight = !elem || elem === document.body
		? window.innerHeight
		: elem.clientHeight;

	switch ( event.keyCode ) {
		case key.up:
			y = -options.arrowScroll;
			break;
		case key.down:
			y = options.arrowScroll;
			break;
		case key.spacebar:
			y = ( event.shiftKey ? -1 : 1 ) * clientHeight * 0.9;
			break;
		case key.pageup:
			y = -clientHeight * 0.9;
			break;
		case key.pagedown:
			y = clientHeight * 0.9;
			break;
		case key.home:
			y = -elem.scrollTop;
			break;
		case key.end:
			damt = elem.scrollHeight - elem.scrollTop - clientHeight;
			y = damt > 0 ? damt + 10 : 0;
			break;
		case key.left:
			x = -options.arrowScroll;
			break;
		case key.right:
			x = options.arrowScroll;
			break;
		default:
			return true;
	}

	scrollArray( elem, x, y );
	event.preventDefault();
}


/**
 * Middle mouse button handler
 * @param {MouseEvent} e
 */
function onMousedown( e ) {
	if ( isMiddleClickScrolling ) {
		return;
	}

	// watch for middle clicks only
	if ( e.button !== 1 ) {
		return;
	}

	let elem = e.target;

	// linux middle mouse shouldn't be overwritten (paste)
	if ( isLinux && ( elem.tagName === "INPUT" || elem.tagName === "TEXTAREA" ) ) {
		return;
	}

	do {
		if (
			// ignore anchors
			   elem.tagName === "A"
			// ignore "no-middleclick-scroll" data attributes
			|| elem.parentNode && elem.dataset.noMiddleclickScroll
		) {
			e.preventDefault();
			return;
		}
	} while ( ( elem = elem.parentNode ) );

	elem = overflowingAncestor( e.target );
	// only apply to scrollable regions
	if ( !elem || elem.clientHeight === elem.scrollHeight ) {
		return;
	}

	// we don't want the default by now
	e.preventDefault();

	// set up a new scrolling phase
	isMiddleClickScrolling = true;

	// reference point
	icon.style.left = `${e.clientX}px`;
	icon.style.top  = `${e.clientY}px`;
	document.body.appendChild( icon );

	const refereceX = e.clientX;
	const refereceY = e.clientY;

	let speedX = 0;
	let speedY = 0;

	// animation loop
	let last = +new Date();
	let finished = false;

	function step( time ) {
		const now = time || +new Date();
		const elapsed = now - last;
		elem.scrollLeft += ( speedX * elapsed ) >> 0;
		elem.scrollTop  += ( speedY * elapsed ) >> 0;
		last = now;
		if ( !finished ) {
			requestAnimationFrame( step );
		}
	}
	requestAnimationFrame( step );

	let first = true;

	function mousemove( e ) {
		const deltaX = Math.abs( refereceX - e.clientX );
		const deltaY = Math.abs( refereceY - e.clientY );
		const movedEnough = Math.max( deltaX, deltaY ) > 10;
		if ( first && movedEnough ) {
			window.addEventListener( "mouseup", remove, false );
			first = false;
		}
		speedX = ( e.clientX - refereceX ) * 10 / 1000;
		speedY = ( e.clientY - refereceY ) * 10 / 1000;
	}

	function remove() {
		window.removeEventListener( "mousemove", mousemove, false );
		window.removeEventListener( "mousedown", remove, false );
		window.removeEventListener( "mouseup", remove, false );
		window.removeEventListener( "keydown", remove, false );
		document.body.removeChild( icon );
		isMiddleClickScrolling = false;
		finished = true;
	}

	window.addEventListener( "mousemove", mousemove, false );
	window.addEventListener( "mousedown", remove, false );
	window.addEventListener( "keydown", remove, false );
}


/***********************************************
 * OVERFLOW
 ***********************************************/

let cache = {};
let cacheID = 0;
let cacheAccess = +new Date();
const cacheThreshold = 10 * 1000;
const cacheProperty = "smoothscrollOverflowID";


function getCacheID( el ) {
	return el[ cacheProperty ] || ( el[ cacheProperty ] = ++cacheID );
}

function setCache( elems, overflowing ) {
	const now = +new Date();
	if ( cacheAccess + cacheThreshold < now ) {
		cache = {};
	}
	cacheAccess = now;

	for ( let i = elems.length; i--; ) {
		cache[ getCacheID( elems[ i ] ) ] = overflowing;
	}

	return overflowing;
}

function overflowingAncestor( el ) {
	const elems = [];
	do {
		const cached = cache[ getCacheID( el ) ];
		if ( cached ) {
			return setCache( elems, cached );
		}
		elems.push( el );
		if ( el.clientHeight < el.scrollHeight ) {
			const overflow = getComputedStyle( el, "" ).getPropertyValue( "overflow-y" );
			if ( overflow === "scroll" || overflow === "auto" ) {
				return setCache( elems, el );
			}
		}
	} while ( ( el = el.parentNode ) );
}


/***********************************************
 * HELPERS
 ***********************************************/

function directionCheck( x, y ) {
	x = x > 0 ? 1 : -1;
	y = y > 0 ? 1 : -1;
	if ( direction.x !== x || direction.y !== y ) {
		direction.x = x;
		direction.y = y;
		queue = [];
		lastScroll = 0;
	}
}


/***********************************************
 * PULSE
 ***********************************************/

/**
 * Viscous fluid with a pulse for part and decay for the rest.
 * - Applies a fixed force over an interval (a damped acceleration), and
 * - Lets the exponential bleed away the velocity over a longer interval
 * - Michael Herf, http://stereopsis.com/stopping/
 */
function pulse_( x ) {
	let val;
	let start;
	let expx;
	// test
	x = x * options.pulseScale;

	if ( x < 1 ) {
		// acceleration
		val = x - ( 1 - Math.exp( -x ) );
	} else {
		// tail
		// the previous animation ended here:
		start = Math.exp( -1 );
		// simple viscous drag
		x -= 1;
		expx = 1 - Math.exp( -x );
		val = start + ( expx * ( 1 - start ) );
	}

	return val * options.pulseNormalize;
}

function pulse( x ) {
	if ( x >= 1 ) { return 1; }
	if ( x <= 0 ) { return 0; }

	if ( options.pulseNormalize === 1 ) {
		options.pulseNormalize /= pulse_( 1 );
	}

	return pulse_( x );
}


export function enable() {
	if ( enabled ) { return; }
	window.addEventListener( "mousewheel", onMousewheel, false );
	window.addEventListener( "mousedown", onMousedown, false );
	window.addEventListener( "keydown", onKeydown, false );
	enabled = true;
}

export function disable() {
	if ( !enabled ) { return; }
	window.removeEventListener( "mousewheel", onMousewheel, false );
	window.removeEventListener( "mousedown", onMousedown, false );
	window.removeEventListener( "keydown", onKeydown, false );
	cache = {};
	enabled = false;
}
