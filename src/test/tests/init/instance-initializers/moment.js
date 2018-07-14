import { module, test } from "qunit";
import { buildOwner, runDestroy } from "test-utils";
import sinon from "sinon";
import { set } from "@ember/object";
import Service from "@ember/service";

import momentInstanceInitializerInjector
	from "inject-loader?moment!init/instance-initializers/moment";


module( "init/instance-initializer/moment", {
	beforeEach() {
		this.momentLocaleSpy = sinon.spy();

		this.owner = buildOwner();
		this.owner.register( "service:i18n", Service.extend({
			locale: "en"
		}) );

		this.subject = () => {
			const { default: instanceInitializer } = momentInstanceInitializerInjector({
				"moment": {
					locale: this.momentLocaleSpy
				}
			});

			return instanceInitializer.initialize( this.owner );
		};
	},

	afterEach() {
		runDestroy( this.owner );
		this.owner = null;
	}
});


test( "Set and update the Moment locale", function( assert ) {

	this.subject();
	assert.ok( this.momentLocaleSpy.calledWithExactly( "en" ), "Sets Moment's locale on init" );

	const i18nService = this.owner.lookup( "service:i18n" );
	set( i18nService, "locale", "de" );
	assert.ok( this.momentLocaleSpy.calledWithExactly( "de" ), "Sets Moment's locale on change" );

});
