import { alias } from "@ember/object/computed";
import { get, computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";
import { fragment } from "ember-data-model-fragments/attributes";
import Moment from "moment";


export default Model.extend({
	/** type {TwitchTicketProduct} */
	product: fragment( "twitch-ticket-product", { defaultValue: {} } ),
	/** type {TwitchTicketPurchaseProfile} */
	purchase_profile: fragment( "twitch-ticket-purchase-profile", { defaultValue: {} } ),

	/** @type ComputedProperty<PromiseProxy<TwitchUser>> */
	partner_login: belongsTo( "twitch-user", { async: true } ),

	access_end: attr( "date" ),
	access_start: attr( "date" ),
	expired: attr( "boolean" ),
	is_gift: attr( "boolean" ),

	/** @type ComputedProperty<PromiseProxy<TwitchChannel>> */
	channel: alias( "partner_login.channel" ),


	// load the chained PromiseProxy
	async loadChannel() {
		const user = this.partner_login;
		await user.promise;
		const channel = user.content.channel;
		await channel.promise;

		return channel.content;
	},


	hasEnded: computed(function() {
		const access_end = get( this, "access_end" );

		return access_end && new Date() > access_end;
	}).volatile(),

	ends: computed(function() {
		const access_end = get( this, "access_end" );

		return new Moment().to( access_end );
	}).volatile(),


	subbedFor: computed( "access_start", "purchase_profile.consecutive_months", function() {
		const purchase_profile = this.purchase_profile;
		if ( purchase_profile ) {
			const months = purchase_profile.consecutive_months;
			if ( Number.isInteger( months ) && months > 0 ) {
				return months;
			}
		}

		const started = this.access_start;
		if ( started ) {
			const diff = new Moment().diff( new Moment( started ), "months", true );

			return Math.ceil( diff );
		}

		return 1;
	})

}).reopenClass({
	toString() { return "api/users/:user_name/tickets"; }
});
