import Controller from "@ember/controller";
import {
	get,
	computed
} from "@ember/object";
import { alias } from "@ember/object/computed";
import { langs } from "config";


const day = 24 * 3600 * 1000;


export default Controller.extend({
	stream: alias( "model.stream" ),
	channel: alias( "model.channel" ),
	panels: alias( "model.panels" ),

	age: computed( "channel.created_at", function() {
		const createdAt = get( this, "channel.created_at" );

		return ( new Date() - createdAt ) / day;
	}),

	language: computed( "channel.broadcaster_language", function() {
		const blang = get( this, "channel.broadcaster_language" );

		return langs.hasOwnProperty( blang )
			? langs[ blang ][ "lang" ]
			: "";
	})
});
