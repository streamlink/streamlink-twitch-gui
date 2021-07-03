import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeIntlService } from "intl-utils";
import sinon from "sinon";
import { set } from "@ember/object";

import momentInstanceInitializerInjector
	from "inject-loader?moment!init/instance-initializers/moment";


module( "init/instance-initializers/moment", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			IntlService: FakeIntlService
		})
	});

	hooks.beforeEach(function() {
		this.momentLocaleSpy = sinon.spy();

		this.subject = () => {
			const { default: instanceInitializer } = momentInstanceInitializerInjector({
				"moment": {
					locale: this.momentLocaleSpy
				}
			});

			return instanceInitializer.initialize( this.owner );
		};
	});


	test( "Set and update the Moment locale", function( assert ) {
		this.subject();
		assert.ok(
			this.momentLocaleSpy.calledWithExactly( "en" ),
			"Sets Moment's locale on init"
		);

		const intlService = this.owner.lookup( "service:intl" );
		set( intlService, "locale", [ "de" ] );
		assert.ok(
			this.momentLocaleSpy.calledWithExactly( "de" ),
			"Sets Moment's locale on change"
		);
	});
});
