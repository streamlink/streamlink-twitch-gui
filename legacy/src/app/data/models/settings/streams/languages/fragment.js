import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { langs as langsConfig } from "config";


const attributes = {};
for ( const [ code, { disabled } ] of Object.entries( langsConfig ) ) {
	if ( disabled ) { continue; }
	attributes[ code ] = attr( "boolean", { defaultValue: false } );
}


export default Fragment.extend( attributes );
