import {
	get,
	set,
	computed,
	inject,
	Controller
} from "Ember";


const { alias, equal } = computed;
const { controller } = inject;


export default Controller.extend({
	application: controller(),

	stream : alias( "model.stream" ),
	channel: alias( "model.channel" ),

	isSubrouteSettings: equal( "application.currentRouteName", "channel.settings" ),
	isAnimated: false,

	actions: {
		toggleSettings() {
			set( this, "isAnimated", true );
			this.transitionToRoute(
				get( this, "isSubrouteSettings" )
					? "channel.index"
					: "channel.settings",
				get( this, "model.channel.id" )
			);
		}
	}
});
