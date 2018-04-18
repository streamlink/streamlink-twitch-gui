import Controller from "@ember/controller";
import { get, set } from "@ember/object";
import { alias } from "@ember/object/computed";
import "./styles.less";


export default Controller.extend({
	summary : alias( "model.summary" ),
	featured: alias( "model.featured" ),

	isAnimated: false,

	// reference the active stream by id
	// so we can safely go back to the route
	_index: 0,

	actions: {
		switchFeatured( index ) {
			if ( index === get( this, "_index" ) ) { return; }
			set( this, "_index", index );
			set( this, "isAnimated", true );
		}
	}
});
