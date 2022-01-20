import { getOwner } from "@ember/application";
import UserIndexRoute from "ui/routes/user/index/route";


export default UserIndexRoute.extend({
	async model() {
		return this.modelFor( "channel" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	}
});
