import Controller from "@ember/controller";
import { get, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";


const day = 24 * 3600 * 1000;


export default Controller.extend({
	/** @type {IntlService} */
	intl: service(),

	stream: alias( "model.stream" ),
	channel: alias( "model.channel" ),

	age: computed( "channel.created_at", function() {
		const createdAt = get( this, "channel.created_at" );

		return ( new Date() - createdAt ) / day;
	}),

	language: computed( "intl.locale", "channel.broadcaster_language", function() {
		const blang = get( this, "channel.broadcaster_language" );

		return blang && this.intl.exists( `languages.${blang}` )
			? this.intl.t( `languages.${blang}` ).toString()
			: "";
	})
});
