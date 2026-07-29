import fireEvent from "@ember/test-helpers/dom/fire-event";
import getElement from "@ember/test-helpers/dom/-get-element";
import isFocusable from "@ember/test-helpers/dom/-is-focusable";
import settled from "@ember/test-helpers/settled";
import { nextTickPromise } from "@ember/test-helpers/-utils";


/**
 * Custom blur event helper based on @ember/test-helpers
 * but always triggers custom `blur` and `focusout` events
 * and also returns the blur event
 * @param {HTMLElement|string} target
 * @returns {Promise<Event>}
 */
export async function blur( target ) {
	await nextTickPromise();

	const element = getElement( target );
	if ( !element ) {
		throw new Error( `Element not found when calling \`blur('${target}')\`.` );
	}

	if ( !isFocusable( element ) ) {
		throw new Error( `${target} is not focusable` );
	}

	element.blur();
	const event = fireEvent( element, "blur" , { bubbles: false } );
	fireEvent( element, "focusout" );

	await settled();

	return event;
}
