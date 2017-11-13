import {
	Fragment,
	fragment
} from "model-fragments";
import { qualitiesStreamlink } from "models/stream/qualities/index";


const attributes = {};
for ( const { id } of qualitiesStreamlink ) {
	attributes[ id ] = fragment( "settingsStreamingQuality", { defaultValue: {} } );
}


export default Fragment.extend( attributes );
