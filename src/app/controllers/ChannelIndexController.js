import {
	get,
	computed,
	Controller
} from "Ember";
import { langs } from "config";


const { alias } = computed;


export default Controller.extend({
	stream : alias( "model.stream" ),
	channel: alias( "model.channel" ),
	panels : alias( "model.panels" ),

	age: function() {
		var createdAt = get( this, "channel.created_at" );
		return ( new Date() - createdAt ) / ( 24 * 3600 * 1000 );
	}.property( "channel.created_at" ),

	language: function() {
		var blang = get( this, "channel.broadcaster_language" );
		var lang  = langs[ blang ];
		return lang ? lang[ "lang" ] : "";
	}.property( "channel.broadcaster_language" )
});
