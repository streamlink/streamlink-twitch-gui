import { get, computed } from "@ember/object";
import Mixin from "@ember/object/mixin";
import { streaming as streamingConfig } from "config";


const { providers } = streamingConfig;


export default Mixin.create({
	// can't use the fragment's isStreamlink computed property here
	// the controller's model is an ObjectBuffer instance
	isStreamlink: computed( "model.streaming.provider", function() {
		const provider = get( this, "model.streaming.provider" );

		return providers[ provider ][ "type" ] === "streamlink";
	})
});
