import {
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	HostingError,
	Warning
} from "../errors";


const errors = [
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	HostingError,
	Warning
];


/**
 * @param {String} data
 * @returns {(Error|null)}
 */
export default function( data ) {
	const Class = errors.find( errorClass => {
		for ( let regex of errorClass.regex ) {
			if ( regex.test( data ) ) {
				return errorClass;
			}
		}
	});

	return Class
		? new Class( data )
		: null;
}
