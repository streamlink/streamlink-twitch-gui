import { attr } from "ember-data";
import { Fragment } from "model-fragments";
import { qualitiesLivestreamer } from "models/stream/qualities/index";


const attributes = {};
for ( const { id } of qualitiesLivestreamer ) {
	attributes[ id ] = attr( "string" );
}


export default Fragment.extend( attributes );
