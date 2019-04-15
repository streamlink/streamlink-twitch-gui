import fireEvent from "@ember/test-helpers/dom/fire-event";
import getElement from "@ember/test-helpers/dom/-get-element";
import settled from "@ember/test-helpers//settled";
import { nextTickPromise } from "@ember/test-helpers/-utils";


/**
 * Triggers an event on the specified target.
 * Based on @ember/test-helpers, but returns its fired event
 *
 * @param {string|Element} target the element or selector to trigger the event on
 * @param {string} eventType the type of event to trigger
 * @param {Object} options additional properties to be set on the event
 * @return {Promise<Event>} resolves when the application is settled
 */
export async function triggerEvent( target, eventType, options ) {
	await nextTickPromise();

	if ( !target ) {
		throw new Error( "Must pass an element or selector to `triggerEvent`." );
	}

	const element = getElement( target );
	if ( !element ) {
		throw new Error( `Element not found when calling \`triggerEvent('${target}', ...)\`.` );
	}

	if ( !eventType ) {
		throw new Error( "Must provide an `eventType` to `triggerEvent`" );
	}

	const event = fireEvent( element, eventType, options );
	await settled();

	return event;
}
