import Controller from "@ember/controller";
import { set, action } from "@ember/object";
import { alias } from "@ember/object/computed";
import "./styles.less";


export default class FeaturedController extends Controller {
	@alias( "model.summary" )
	summary;
	@alias( "model.featured" )
	featured;

	isAnimated = false;

	// reference the active stream by id
	// so we can safely go back to the route
	_index = 0;

	@action
	switchFeatured( index ) {
		if ( index === this._index ) { return; }
		set( this, "_index", index );
		set( this, "isAnimated", true );
	}
}
