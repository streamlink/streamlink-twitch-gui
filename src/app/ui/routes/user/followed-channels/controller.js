import Controller from "@ember/controller";
import { set, action } from "@ember/object";


export default class UserFollowedChannelsRoute extends Controller {
	queryParams = [ "sortby", "direction" ];

	sortby = "created_at";
	direction = "desc";

	@action
	sortMethod( sortby ) {
		set( this, "sortby", sortby );
	}

	@action
	sortOrder( direction ) {
		set( this, "direction", direction );
	}
}
