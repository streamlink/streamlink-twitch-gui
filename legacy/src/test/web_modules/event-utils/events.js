/*
 * Stubs methods on the Event.prototype and EventTarget.prototype, so native DOM events can be
 * properly tested. Has a similar API compared to jQuery's event API.
 * This should probably be released as a separate node module and added to the project's devDeps.
 */

const { Event, EventTarget } = window;

const { stopPropagation, stopImmediatePropagation } = Event.prototype;
const { addEventListener, removeEventListener } = EventTarget.prototype;


/**
 * @typedef {Object} EventListenerOptions
 * @property {boolean?} capture
 * @property {boolean?} once
 * @property {boolean?} passive
 */


/** @type {WeakMap<Element, EventListenerData[]> */
let eventMap;
/** @type {WeakMap<Element, EventListenerData[]> */
let eventCaptureMap;

/** @type {WeakMap<Event, boolean> */
let stopPropagationMap;
/** @type {WeakMap<Event, boolean> */
let stopImmediatePropagationMap;


function reset() {
	eventMap = new WeakMap();
	eventCaptureMap = new WeakMap();
	stopPropagationMap = new WeakMap();
	stopImmediatePropagationMap = new WeakMap();
}


/**
 * @class EventListenerData
 * @property {string} name
 * @property {Function} handler
 * @property {EventListenerOptions} options
 * @property {Function} wrapper
 */
class EventListenerData {
	/**
	 * @param {Element} element
	 * @param {string} name
	 * @param {Function} handler
	 * @param {EventListenerOptions} options
	 */
	constructor( element, name, handler, options ) {
		const self = this;

		this.name = name;
		this.handler = handler;
		this.options = options;

		this.wrapper = function() {
			if ( options.once ) {
				const listeners = getEventListenerDataArray( element, options.capture );
				for ( let i = 0, len = listeners.length; i < len; i++ ) {
					const item = listeners[ i ];
					if ( item === self ) {
						listeners.splice( i, 1 );
						--i;
						--len;
					}
				}
			}

			return handler.apply( this, arguments );
		};
	}
}


function normalizeOptions( options ) {
	return typeof options === "object"
		? {
			capture: !!options.capture,
			once: !!options.once,
			passive: !!options.passive
		} : {
			capture: !!options,
			once: false,
			passive: false
		};
}

/**
 * @param {Element} element
 * @param {boolean?} capture
 * @returns {EventListenerData[]}
 */
function getEventListenerDataArray( element, capture ) {
	const map = capture
		? eventCaptureMap
		: eventMap;

	if ( map.has( element ) ) {
		return map.get( element );
	}

	const listeners = [];
	map.set( element, listeners );

	return listeners;
}


/**
 * @param {string} name
 * @param {Function} handler
 * @param {(boolean|EventListenerOptions)?} options
 * @this {EventTarget}
 * @returns {boolean}
 */
function newAddEventListener( name, handler, options ) {
	options = normalizeOptions( options );
	const listeners = getEventListenerDataArray( this, options.capture );
	const data = new EventListenerData( this, name, handler, options );
	listeners.push( data );

	return addEventListener.call( this, name, data.wrapper, options );
}

/**
 * @param {string} name
 * @param {Function} handler
 * @param {(boolean|EventListenerOptions)?} options
 * @this {EventTarget}
 * @returns {boolean}
 */
function newRemoveEventListener( name, handler, options ) {
	options = normalizeOptions( options );
	let success = false;

	const arr = getEventListenerDataArray( this, options.capture );
	for ( let i = 0, len = arr.length; i < len; i++ ) {
		/** @type {EventListenerData} */
		const data = arr[ i ];
		if ( name === data.name && handler === data.handler ) {
			arr.splice( i, 1 );
			--i;
			--len;
			success = removeEventListener.call( this, name, data.wrapper, options )
				/* istanbul ignore next */
				|| success;
		}
	}

	return success;
}

/**
 * @this {Event}
 * @returns {boolean}
 */
function newStopPropagation() {
	stopPropagationMap.set( this, true );

	return stopPropagation.apply( this, arguments );
}

/**
 * @this {Event}
 * @returns {boolean}
 */
function newStopImmediatePropagation() {
	stopImmediatePropagationMap.set( this, true );

	return stopImmediatePropagation.apply( this, arguments );
}


/**
 * @param {Element} element
 * @param {string?} name
 * @param {boolean?} capture
 * @returns {{handler: EventListenerData.handler, name: EventListenerData.name}[]}
 */
export function getListeners( element, name = undefined, capture = false ) {
	let arr = getEventListenerDataArray( element, capture );

	if ( name ) {
		arr = arr.filter( data => data.name === name );
	}

	return arr.map( ({ name, handler }) => ({ name, handler }) );
}

/**
 * @param {Element} element
 * @param {string?} name
 * @param {Function?} handler
 * @param {boolean?} capture
 * @returns {boolean}
 */
export function hasListener( element, name = undefined, handler = undefined, capture = false ) {
	const arr = getEventListenerDataArray( element, capture );

	return name
		? handler
			? arr.some( data => data.name === name && data.handler === handler )
			: arr.some( data => data.name === name )
		: arr.length > 0;
}

/**
 * @param {Event} event
 * @returns {boolean}
 */
export function isDefaultPrevented( event ) {
	return !!event.defaultPrevented;
}

/**
 * @param {Event} event
 * @returns {boolean}
 */
export function isPropagationStopped( event ) {
	return stopPropagationMap.has( event );
}

/**
 * @param {Event} event
 * @returns {boolean}
 */
export function isImmediatePropagationStopped( event ) {
	return stopImmediatePropagationMap.has( event );
}


/**
 * @param {NestedHooks} hooks
 */
export function stubDOMEvents( hooks ) {
	hooks.before(function() {
		reset();
		EventTarget.prototype.addEventListener = newAddEventListener;
		EventTarget.prototype.removeEventListener = newRemoveEventListener;
		Event.prototype.stopPropagation = newStopPropagation;
		Event.prototype.stopImmediatePropagation = newStopImmediatePropagation;
	});

	hooks.after(function() {
		reset();
		EventTarget.prototype.addEventListener = addEventListener;
		EventTarget.prototype.removeEventListener = removeEventListener;
		Event.prototype.stopPropagation = stopPropagation;
		Event.prototype.stopImmediatePropagation = stopImmediatePropagation;
	});
}
