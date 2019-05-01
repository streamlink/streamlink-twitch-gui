import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";


export default class UserIndexController extends Controller {
	/** @type {I18nService} */
	@service i18n;

	@alias( "model.stream" )
	stream;
	@alias( "model.channel" )
	channel;

	@computed( "channel.created_at" )
	get age() {
		const createdAt = this.channel.created_at;

		return ( new Date() - createdAt ) / ( 24 * 3600 * 1000 );
	}

	@computed( "i18n.locale", "channel.broadcaster_language" )
	get language() {
		const blang = this.channel.broadcaster_language;

		return blang && this.i18n.exists( `languages.${blang}` )
			? this.i18n.t( `languages.${blang}` ).toString()
			: "";
	}
}
