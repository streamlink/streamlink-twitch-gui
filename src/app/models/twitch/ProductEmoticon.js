import {
	attr,
	Model
} from "ember-data";


// These records have a different structure in comparison to /kraken/chat/emoticons
// So we're defining another model explicitly for those
export default Model.extend({
	regex: attr( "string" ),
	regex_display: attr( "string" ),
	state: attr( "string" ),
	url: attr( "string" )

}).reopenClass({
	toString() { return "twitchProductEmoticon"; }
});
