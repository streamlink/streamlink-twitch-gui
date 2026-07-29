import { getOwner } from "@ember/application";
import UserIndexRoute from "ui/routes/user/index/route";


export default UserIndexRoute.extend({
	model() {
		return this.modelFor( "team" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:team" ).refresh();
	}
});
