import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import sinon from "sinon";

import Component from "@ember/component";
import Evented from "@ember/object/evented";
import Service from "@ember/service";

import { hotkey, hotkeysNamespace } from "utils/decorators";
import hotkeyServiceInjector from "inject-loader?config!services/hotkey";
import HotkeyMixin from "ui/components/-mixins/hotkey";


module( "utils/decorators/hotkeys", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			I18nService: FakeI18nService,
			SettingsService: Service.extend( Evented )
		})
	});

	const { hasOwnProperty } = {};
	const HotkeyComponent = Component.extend( HotkeyMixin );

	hooks.beforeEach(function() {
		this.subject = hotkeys => {
			const { default: HotkeyService } = hotkeyServiceInjector({
				config: { hotkeys }
			});
			this.owner.register( "service:hotkey", HotkeyService );

			return this.owner.lookup( "service:hotkey" );
		};
	});

	test( "hotkey decorators", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			foo: {
				actions: {
					a: [{ code: "KeyA" }],
					b: [{ code: "KeyB" }],
					c: [{ code: "KeyC" }]
				}
			},
			bar: {
				actions: {
					a: [{ code: "KeyA" }]
				}
			}
		});
		const fooASpy = sinon.spy();
		const fooBSpy = sinon.spy();
		const fooCSpy = sinon.spy();
		const barASpy = sinon.spy();

		@hotkeysNamespace( "foo" )
		class FooComponent extends HotkeyComponent {
			@hotkey
			a() {
				fooASpy.apply( this, ...arguments );
			}
			@hotkey()
			b() {
				fooBSpy.apply( this, ...arguments );
			}
			@hotkey( "c" )
			d() {
				fooCSpy.apply( this, ...arguments );
			}
		}
		@hotkeysNamespace( "bar" )
		class BarComponent extends FooComponent {
			@hotkey
			a() {
				barASpy.apply( this, ...arguments );
			}
		}

		this.owner.register( "component:foo", FooComponent );
		this.owner.register( "component:bar", BarComponent );

		const foo = this.owner.lookup( "component:foo" );
		const bar = this.owner.lookup( "component:bar" );
		const fooProto = Object.getPrototypeOf( foo );
		const { hotkeys: fooHotkeys, hotkeysNamespace: fooNamespace } = fooProto;
		const barProto = Object.getPrototypeOf( bar );
		const { hotkeys: barHotkeys, hotkeysNamespace: barNamespace } = barProto;

		assert.propEqual( fooNamespace, [ "foo" ], "foo has correct namespace" );
		assert.strictEqual( typeof fooHotkeys, "object", "hotkeys object is on the foo prototype" );
		assert.ok( hasOwnProperty.call( fooProto, "a" ), "'a' is on the foo prototype" );
		assert.ok( hasOwnProperty.call( fooProto, "b" ), "'b' is on the foo prototype" );
		assert.notOk( hasOwnProperty.call( fooProto, "c" ), "'c' is not on the foo prototype" );
		assert.ok( hasOwnProperty.call( fooProto, "d" ), "'d' is on the foo prototype" );
		assert.ok( hasOwnProperty.call( fooHotkeys, "a" ), "'a' is a foo hotkey" );
		assert.ok( hasOwnProperty.call( fooHotkeys, "b" ), "'b' is a foo hotkey" );
		assert.ok( hasOwnProperty.call( fooHotkeys, "c" ), "'c' is a foo hotkey" );
		assert.notOk( hasOwnProperty.call( fooHotkeys, "d" ), "'d' is not a foo hotkey" );

		assert.propEqual( barNamespace, [ "foo", "bar" ], "bar has correct inherited namespace" );
		assert.strictEqual( typeof barHotkeys, "object", "hotkeys object is on the bar prototype" );
		assert.ok( hasOwnProperty.call( barProto, "a" ), "'a' is on the bar prototype" );
		assert.notOk( hasOwnProperty.call( barProto, "b" ), "'b' is not on the bar prototype" );
		assert.notOk( hasOwnProperty.call( barProto, "c" ), "'c' is not on the bar prototype" );
		assert.notOk( hasOwnProperty.call( barProto, "d" ), "'d' is not on the bar prototype" );
		assert.ok( hasOwnProperty.call( barHotkeys, "a" ), "'a' is a bar hotkey" );
		assert.ok( hasOwnProperty.call( barHotkeys, "b" ), "'b' is a bar hotkey" );
		assert.ok( hasOwnProperty.call( barHotkeys, "c" ), "'c' is a bar hotkey" );
		assert.notOk( hasOwnProperty.call( barHotkeys, "d" ), "'d' is not a bar hotkey" );

		service.register( foo );
		service.register( bar );

		service.trigger( new KeyboardEvent( "keydown", { code: "KeyA" } ) );
		assert.notOk( fooASpy.called, "Doesn't execute 'a' callback on foo" );
		assert.ok( barASpy.calledOnce, "Executes 'a' callback on bar" );

		service.trigger( new KeyboardEvent( "keydown", { code: "KeyB" } ) );
		assert.ok( fooBSpy.calledOnce, "Executes 'b' callback on foo" );

		service.trigger( new KeyboardEvent( "keydown", { code: "KeyC" } ) );
		assert.ok( fooCSpy.calledOnce, "Executes 'c' callback on foo" );
	});
});
