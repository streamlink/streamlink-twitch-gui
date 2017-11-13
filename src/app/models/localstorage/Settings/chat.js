import { attr } from "ember-data";
import {
	Fragment,
	fragment
} from "model-fragments";


export default Fragment.extend({
	provider: attr( "string", { defaultValue: "default" } ),
	providers: fragment( "settingsChatProviders", { defaultValue: {} } )
});
