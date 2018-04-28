import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import { I18nService } from "i18n-utils";

import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";


moduleForComponent( "ui/components/helper/hotkey-title", {
	integration: true,
	resolver: buildResolver({
		HotkeyTitleHelper,
		I18nService
	})
});


test( "HotkeyTitleHelper", function( assert ) {

	this.setProperties({
		hotkey: {
			code: "Enter",
			ctrlKey: true,
			shiftKey: true
		}
	});
	this.render( hbs`{{hotkey-title "foo" hotkey foo="bar"}}` );

	assert.strictEqual(
		this.$().text().trim(),
		"[hotkeys.modifiers.ctrl+hotkeys.modifiers.shift+hotkeys.keys.Enter] foo{\"foo\":\"bar\"}",
		"Sets the correct title with hotkey data and translation data"
	);

});
