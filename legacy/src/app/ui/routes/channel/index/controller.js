import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";


export default Controller.extend({
	/** @type {IntlService} */
	intl: service(),

	/** @type {TwitchStream} */
	stream: alias( "model.stream" ),
	/** @type {TwitchUser} */
	user: alias( "model.user" ),
	/** @type {TwitchChannel} */
	channel: alias( "model.channel" ),

	age: computed( "user.created_at", function() {
		return ( new Date() - this.user.created_at ) / ( 24 * 3600 * 1000 );
	}),

	language: computed( "intl.locale", "channel.broadcaster_language", function() {
		const { broadcaster_language: blang } = this.channel;

		return blang && this.intl.exists( `languages.${blang}` )
			? this.intl.t( `languages.${blang}` ).toString()
			: "";
	})
});
