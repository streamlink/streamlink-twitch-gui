import { getOwner } from "@ember/application";
import Route from "@ember/routing/route";


export default class TeamInfoRoute extends Route {
	model() {
		return this.modelFor( "team" );
	}

	refresh() {
		return getOwner( this ).lookup( "route:team" ).refresh();
	}
}
