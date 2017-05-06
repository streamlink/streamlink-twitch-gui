import { get } from "ember";
import { Aborted } from "./errors";


export default function( stream ) {
	if ( get( stream, "isAborted" ) ) {
		// remove the record from the store
		if ( !get( stream, "isDeleted" ) ) {
			stream.destroyRecord();
		}

		throw new Aborted();
	}
}
