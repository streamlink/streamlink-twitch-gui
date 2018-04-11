import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { qualitiesLivestreamer } from "data/models/stream/model";


const attributes = {};
for ( const { id } of qualitiesLivestreamer ) {
	attributes[ id ] = attr( "string" );
}


export default Fragment.extend( attributes );
