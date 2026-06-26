import { getOwner } from "@ember/application";
import { set } from "@ember/object";
import { inject as service } from "@ember/service";
import { AdapterError } from "ember-data/adapters/errors";
import UserIndexRoute from "ui/routes/user/index/route";


export default UserIndexRoute.extend({
	/** @type {DS.Store} */
	store: service(),

	async model() {
		return this.modelFor( "channel" );
	},

	refresh() {
		return getOwner( this ).lookup( "route:channel" ).refresh();
	},

	async setupController( controller, model ) {
		this._super( controller, model );
		await this._loadSubscription( controller, model );
	},

	/**
	 * @param {Controller} controller
	 * @param {Object} model
	 * @returns {Promise}
	 */
	async _loadSubscription( controller, model ) {
		set( controller, "isSubscribed", false );
		set( controller, "subscriptionTier", null );

		const { session } = this.auth;
		if ( !session || !session.isLoggedIn ) {
			return;
		}

		try {
			const subscription = await this.store.queryRecord( "twitch-subscription", {
				broadcaster_id: model.user.id,
				user_id: session.user_id
			});
			set( controller, "isSubscribed", true );
			set( controller, "subscriptionTier", subscription.tier );
		} catch ( e ) {
			if ( e instanceof AdapterError ) {
				const status = e.errors && e.errors[ 0 ] && e.errors[ 0 ].status;
				if ( status === 404 || status === "404" ) {
					return;
				}
			}
		}
	}
});
