import {
	computed,
	inject,
	Controller
} from "Ember";
import Settings from "models/localstorage/Settings";


const { alias, equal } = computed;
const { service } = inject;


export default Controller.extend({
	chat: service(),

	substitutionsChatCustom: alias( "chat.substitutionsCustom" ),

	chatMethods: computed(function() {
		return Settings.chat_methods
			.filter( method => !method.disabled );
	}),

	// TODO: use presets similar to streamproviders and players

	isChatMethodDefault: equal( "model.chat_method", "default" ),
	isChatMethodMSIE   : equal( "model.chat_method", "msie" ),
	isChatMethodCustom : equal( "model.chat_method", "custom" ),
	isChatMethodChatty : equal( "model.chat_method", "chatty" )
});
