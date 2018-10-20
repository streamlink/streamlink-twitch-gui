import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";


module( "ui/components/helper/hotkey-title", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyTitleHelper,
			I18nService: FakeI18nService
		})
	});


	test( "HotkeyTitleHelper", async function( assert ) {
		this.setProperties({
			hotkey: {
				code: "Enter",
				ctrlKey: true,
				shiftKey: true
			}
		});
		await render( hbs`{{hotkey-title "foo" hotkey foo="bar"}}` );

		assert.strictEqual(
			this.element.innerText,
			// eslint-disable-next-line quotes
			'[hotkeys.modifiers.ctrl+hotkeys.modifiers.shift+hotkeys.keys.Enter] foo{"foo":"bar"}',
			"Sets the correct title with hotkey data and translation data"
		);
	});

});
