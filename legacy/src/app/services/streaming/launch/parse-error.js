import {
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	Warning
} from "../errors";


const errors = [
	PlayerError,
	UnableToOpenError,
	NoStreamsFoundError,
	TimeoutError,
	Warning
];


/**
 * @param {String} data
 * @returns {(Error|null)}
 */
export default function( data ) {
	for ( let ErrorClass of errors ) {
		for ( let regex of ErrorClass.regex ) {
			const match = regex.exec( data );
			if ( match ) {
				return new ErrorClass( ...match );
			}
		}
	}
	return null;
}
