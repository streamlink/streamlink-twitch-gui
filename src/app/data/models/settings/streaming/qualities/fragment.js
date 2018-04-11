import Fragment from "ember-data-model-fragments/fragment";
import { fragment } from "ember-data-model-fragments/attributes";
import { qualitiesStreamlink } from "data/models/stream/model";


const attributes = {};
for ( const { id } of qualitiesStreamlink ) {
	attributes[ id ] = fragment( "settingsStreamingQuality", { defaultValue: {} } );
}


export default Fragment.extend( attributes );
