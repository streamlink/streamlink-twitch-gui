import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";


const day = 24 * 3600 * 1000;


export default Controller.extend({
	i18n: service(),

	stream: alias( "model.stream" ),
	channel: alias( "model.channel" ),
	panels: alias( "model.panels" ),

	age: computed( "channel.created_at", function() {
		const createdAt = get( this, "channel.created_at" );

		return ( new Date() - createdAt ) / day;
	}),

	language: computed( "i18n.locale", "channel.broadcaster_language", function() {
		const i18n = get( this, "i18n" );
		const blang = get( this, "channel.broadcaster_language" );

		return blang && i18n.exists( `languages.${blang}` )
			? i18n.t( `languages.${blang}` ).toString()
			: "";
	})
});
