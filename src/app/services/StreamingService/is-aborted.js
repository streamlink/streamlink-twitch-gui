import { get } from "ember";
import { Aborted } from "./errors";


export default function isAborted( stream ) {
	if ( get( stream, "aborted" ) ) {
		// remove the record from the store
		if ( !get( stream, "isDeleted" ) ) {
			stream.destroyRecord();
		}

		throw new Aborted();
	}
}
