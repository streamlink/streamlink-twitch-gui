import { defineProperty } from "@ember/object";
import attr from "ember-data/attr";
import Fragment from "ember-data-model-fragments/fragment";
import { chat as chatConfig } from "config";
import chatProviders from "services/chat/providers";


const typeKey = "type";
const providers = new Map();


// chat providers don't share common attributes
class SettingsChatProvider extends Fragment {}


const { hasOwnProperty } = {};
const { isArray } = Array;

for ( const [ id ] of Object.entries( chatProviders ) ) {
	// a chat provider needs to have a config object (at least a label is required)
	if ( !hasOwnProperty.call( chatConfig, id ) ) { continue; }

	const provider = class extends SettingsChatProvider {};

	// dynamic fragment attributes defined in the chat config file
	const { attributes } = chatConfig[ id ];
	if ( isArray( attributes ) ) {
		for ( const param of attributes ) {
			const { name, type } = param;
			// set the whole config object as attribute options object
			// this will be used in the SettingsChatRoute template via attribute.options.property
			const prop = attr( type, param );
			defineProperty( provider.prototype, name, prop );
		}
	}

	providers.set( id, provider );
}


export {
	typeKey,
	providers,
	SettingsChatProvider as default
};
