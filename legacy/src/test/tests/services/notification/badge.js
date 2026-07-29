import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import { set } from "@ember/object";
import Service from "@ember/service";

import NotificationServiceBadgeMixin from "services/notification/badge";


module( "services/notification/badge", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			NotificationService: Service.extend( NotificationServiceBadgeMixin )
		})
	});

	/** @typedef {Object} TestContextNotificationServiceBadgeMixin */
	/** @this {TestContextNotificationServiceBadgeMixin} */
	hooks.beforeEach(function() {
		this.setBadgeLabelSpy = sinon.spy();

		this.owner.register( "service:nwjs", Service.extend({
			setBadgeLabel: this.setBadgeLabelSpy
		}) );
		this.owner.register( "service:settings", Service.extend({
			content: {
				notification: {
					badgelabel: false
				}
			}
		}) );
	});

	/** @this {TestContextNotificationServiceBadgeMixin} */
	test( "Badge", function( assert ) {
		const settings = this.owner.lookup( "service:settings" );
		const service = this.owner.lookup( "service:notification" );

		service.trigger( "streams-all", [ {}, {} ] );
		assert.notOk(
			this.setBadgeLabelSpy.called,
			"Doesn't update the label when not running or disabled in settings"
		);

		set( settings, "content.notification.badgelabel", true );
		service.trigger( "streams-all", [ {}, {} ] );
		assert.notOk(
			this.setBadgeLabelSpy.called,
			"Doesn't update the label when enabled, but not running"
		);

		set( service, "running", true );

		service.trigger( "streams-all", [ {}, {} ] );
		assert.propEqual( this.setBadgeLabelSpy.args, [[ "2" ]], "Sets label to 2" );
		this.setBadgeLabelSpy.resetHistory();

		service.trigger( "streams-all", [ {}, {}, {} ] );
		assert.propEqual( this.setBadgeLabelSpy.args, [[ "3" ]], "Sets label to 3" );
		this.setBadgeLabelSpy.resetHistory();

		set( settings, "content.notification.badgelabel", false );
		assert.propEqual( this.setBadgeLabelSpy.args, [[ "" ]], "Clears label when disabled" );
		this.setBadgeLabelSpy.resetHistory();

		set( settings, "content.notification.badgelabel", true );
		assert.notOk(
			this.setBadgeLabelSpy.called,
			"Doesn't reset label, requires a new streams-all event"
		);

		service.trigger( "streams-all", [ {} ] );
		assert.propEqual( this.setBadgeLabelSpy.args, [[ "1" ]], "Sets label to 1" );
		this.setBadgeLabelSpy.resetHistory();

		set( service, "running", false );
		assert.propEqual( this.setBadgeLabelSpy.args, [[ "" ]], "Clears label when service stops" );
	});
});
