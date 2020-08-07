import { Aborted } from "./errors";


export default function( stream ) {
	if ( stream.isAborted ) {
		// remove the record from the store
		if ( !stream.isDeleted ) {
			stream.destroyRecord();
		}

		throw new Aborted();
	}
}
