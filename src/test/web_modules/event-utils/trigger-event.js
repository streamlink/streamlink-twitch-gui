import { run } from "@ember/runloop";
import $ from "jquery";


/**
 * Triggers an event on the specified target.
 * Based on @ember/test-helpers, but uses jQuery for now
 *
 * @param {string|Element} target the element or selector to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @return {Promise<Event>} resolves when the application is settled
 */
export async function triggerEvent( target, eventType, options ) {
	const e = $.Event( eventType );
	Object.assign( e, options );
	run( () => $( target ).trigger( e ) );

	return e;
}
