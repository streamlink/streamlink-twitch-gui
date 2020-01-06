import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import Component from "@ember/component";
import Evented from "@ember/object/evented";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";
import hotkeyServiceInjector from "inject-loader?config!services/hotkey";
import HotkeyMixin from "ui/components/-mixins/hotkey";


module( "ui/components/helper/hotkey-title", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HotkeyTitleHelper,
			I18nService: FakeI18nService,
			THelper: FakeTHelper,
			SettingsService: Service.extend( Evented )
		})
	});

	hooks.beforeEach(function() {
		this.subject = hotkeys => {
			const { default: HotkeyService } = hotkeyServiceInjector({
				config: { hotkeys }
			});
			this.owner.register( "service:hotkey", HotkeyService );

			return this.owner.lookup( "service:hotkey" );
		};
	});


	test( "Namespace and action", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "Escape",
						ctrlKey: true
					}]
				}
			}
		});
		const i18n = this.owner.lookup( "service:i18n" );
		i18n.addTranslations( "en", { "hotkeys.codes.Escape": "Esc" } );

		await render( hbs`{{hotkey-title namespace="invalid" action="invalid"}}` );
		assert.strictEqual(
			this.element.innerText,
			"",
			"Returns empty string on invalid namespace or action"
		);

		await render( hbs`{{hotkey-title namespace="namespaceA"}}` );
		assert.strictEqual(
			this.element.innerText,
			"",
			"Returns empty string on missing action"
		);

		await render( hbs`{{hotkey-title action="actionA"}}` );
		assert.strictEqual(
			this.element.innerText,
			"",
			"Returns empty string on missing namespace"
		);

		await render( hbs`{{hotkey-title namespace="namespaceA" action="actionA"}}` );
		assert.strictEqual(
			this.element.innerText,
			"hotkeys.modifiers.ctrlKey+Esc",
			"Returns correct hotkey string without a title"
		);

		await render( hbs`{{hotkey-title namespace="namespaceA" action="actionA" title="foo"}}` );
		assert.strictEqual(
			this.element.innerText,
			"[hotkeys.modifiers.ctrlKey+Esc] foo",
			"Returns correct hotkey string with a title"
		);

		await render( hbs`{{hotkey-title
			namespace="namespaceA"
			action="actionA"
			title=(t "some.translation" a="1")
		}}` );
		assert.strictEqual(
			this.element.innerText,
			"[hotkeys.modifiers.ctrlKey+Esc] some.translation{\"a\":\"1\"}",
			"Returns correct hotkey string with an i18n title"
		);
	});

	test( "Context", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "Escape",
						ctrlKey: true
					}]
				}
			}
		});
		const i18n = this.owner.lookup( "service:i18n" );
		i18n.addTranslations( "en", { "hotkeys.codes.Escape": "Esc" } );

		this.owner.register( "component:component-a", Component.extend( HotkeyMixin, {
			layout: hbs`{{hotkey-title context=this action=action title=title}}`,
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA: new Function() }
		}) );

		await render( hbs`{{component-a action="actionA"}}` );
		assert.strictEqual(
			this.element.innerText,
			"hotkeys.modifiers.ctrlKey+Esc",
			"Returns correct hotkey string from context"
		);

		await render( hbs`{{component-a action="invalid"}}` );
		assert.strictEqual(
			this.element.innerText,
			"",
			"Returns empty hotkey string on invalid action"
		);

		await render( hbs`{{component-a action="actionA" title=(t "some.translation" a="1")}}` );
		assert.strictEqual(
			this.element.innerText,
			"[hotkeys.modifiers.ctrlKey+Esc] some.translation{\"a\":\"1\"}",
			"Returns correct hotkey string from context with an i18n title"
		);

		await render( hbs`{{component-a action=""}}` );
		assert.strictEqual(
			this.element.innerText,
			"",
			"Returns empty hotkey string on missing action"
		);

		await render( hbs`{{component-a action="" title="foo"}}` );
		assert.strictEqual(
			this.element.innerText,
			"foo",
			"Simply returns title on missing action if title is set"
		);
	});

	test( "Hotkey", async function( assert ) {
		this.subject({});

		await render( hbs`{{hotkey-title hotkey=(hash code="Enter" ctrlKey=true)}}` );
		assert.strictEqual(
			this.element.innerText,
			"hotkeys.modifiers.ctrlKey+Enter",
			"Returns string from hotkey object"
		);

		await render( hbs`{{hotkey-title hotkey=(hash code="Enter" ctrlKey=true) title="foo"}}` );
		assert.strictEqual(
			this.element.innerText,
			"[hotkeys.modifiers.ctrlKey+Enter] foo",
			"Returns string from hotkey object with title"
		);
	});

	test( "Recompute", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "Escape",
						ctrlKey: true
					}]
				}
			}
		});
		const i18n = this.owner.lookup( "service:i18n" );
		i18n.addTranslations( "en", { "hotkeys.codes.Escape": "Esc" } );

		await render( hbs`{{hotkey-title namespace="namespaceA" action="actionA"}}` );
		assert.strictEqual(
			this.element.innerText,
			"hotkeys.modifiers.ctrlKey+Esc",
			"Returns correct hotkey string"
		);

		i18n.addTranslations( "en", { "hotkeys.codes.Escape": "Escape" } );
		run( () => i18n.notifyPropertyChange( "locale" ) );
		assert.strictEqual(
			this.element.innerText,
			"hotkeys.modifiers.ctrlKey+Escape",
			"Recomputes helper on locale change"
		);
	});

});
