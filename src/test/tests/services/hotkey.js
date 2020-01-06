import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import {
	stubDOMEvents,
	isDefaultPrevented,
	isImmediatePropagationStopped,
	triggerEvent
} from "event-utils";
import { render, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import cartesian from "cartesian-product";
import sinon from "sinon";

import Component from "@ember/component";
import Evented from "@ember/object/evented";
import { run } from "@ember/runloop";
import Service from "@ember/service";

import HotkeyMixin from "ui/components/-mixins/hotkey";
import hotkeyServiceInjector from "inject-loader?config!services/hotkey";


module( "services/hotkey", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			I18nService: FakeI18nService
		})
	});

	const HotkeyComponent = Component.extend( HotkeyMixin );

	stubDOMEvents( hooks );

	hooks.beforeEach(function () {
		this.subject = hotkeys => {
			const { default: HotkeyService } = hotkeyServiceInjector({
				config: { hotkeys }
			});
			this.owner.register( "service:hotkey", HotkeyService );

			return this.owner.lookup( "service:hotkey" );
		};

		this.owner.register( "service:settings", class extends Service.extend( Evented ) {
			_initialized = false;
			_content = {};
			get content() {
				return this._content;
			}
			set content( content ) {
				const { hotkeys } = content;
				Object.defineProperty( content.hotkeys, "toJSON", {
					enumerable: false,
					value: () => hotkeys
				});
				this._content = content;
				this.trigger( this._initialized ? "didUpdate" : "initialized" );
				this._initialized = true;
			}
		} );
	});

	hooks.beforeEach(function() {
		this.parentlistener = sinon.spy();
		this.element.parentElement.addEventListener( "keyup", this.parentlistener );

		this.element.addEventListener(
			"keyup",
			e => this.owner.lookup( "service:hotkey" ).trigger( e )
		);
	});

	hooks.afterEach(function() {
		this.element.parentElement.removeEventListener( "keyup", this.parentlistener );
	});


	test( "Invalid hotkey registrations", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			namespace: {
				actions: {
					action: [{
						code: "Enter"
					}]
				}
			}
		});

		this.owner.register( "component:fail-a", HotkeyComponent.extend() );
		this.owner.register( "component:fail-b", HotkeyComponent.extend({
			hotkeys: { action: new Function() }
		}) );
		this.owner.register( "component:fail-c", HotkeyComponent.extend({
			hotkeysNamespace: "namespace"
		}) );
		this.owner.register( "component:fail-d", HotkeyComponent.extend({
			hotkeysNamespace: "invalid",
			hotkeys: { action: new Function() }
		}) );
		this.owner.register( "component:fail-e", HotkeyComponent.extend({
			hotkeysNamespace: "namespace",
			hotkeys: { invalid: new Function() }
		}) );

		await render( hbs`{{fail-a}}{{fail-b}}{{fail-c}}{{fail-d}}{{fail-e}}` );

		assert.strictEqual( service.registries.length, 0, "Doesn't register invalid components" );
	});


	test( "Simple hotkey registrations", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "KeyA"
					}],
					actionB: [{
						code: "KeyB"
					}]
				}
			},
			namespaceB: {
				actions: {
					actionC: [{
						code: "KeyC"
					}],
					actionD: [{
						code: "KeyD"
					}]
				}
			}
		});

		const actionA = sinon.spy();
		const actionC = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA, actionB: new Function() }
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { actionC: "actionC", actionD: new Function() },
			actions: { actionC }
		}) );

		await render( hbs`{{component-a}}{{component-b}}` );

		assert.propEqual(
			service.registries.map( r => r.id ),
			[
				"namespaceB.actionC",
				"namespaceB.actionD",
				"namespaceA.actionA",
				"namespaceA.actionB"
			],
			"Has four hotkey registries in correct order"
		);
		assert.strictEqual( service.hotkeys.size, 4, "Has four hotkey map items" );

		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		assert.ok( actionA.calledOnce, "Calls actionA" );
		assert.notOk( actionC.called, "Doesn't call actionC" );
		assert.notOk( this.parentlistener.called, "Doesn't propagate matching events" );
		actionA.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyC" } );
		assert.notOk( actionA.called, "Doesn't call actionA" );
		assert.ok( actionC.calledOnce, "Calls actionC" );
		assert.notOk( this.parentlistener.called, "Doesn't propagate matching events" );
		actionC.resetHistory();

		const event = await triggerEvent( this.element, "keyup", { code: "Escape" } );
		assert.notOk( actionA.called, "Doesn't call actionA" );
		assert.notOk( actionC.called, "Doesn't call actionC" );
		assert.ok(
			this.parentlistener.calledWithExactly( event ),
			"Lets non-matching events bubble up"
		);
	});


	test( "Hotkeys with modifiers", async function( assert ) {
		this.subject({
			namespace: {
				actions: {
					action: [{
						code: "Escape",
						altKey: true,
						ctrlKey: true,
						metaKey: true,
						shiftKey: true
					}]
				}
			}
		});
		const action = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespace",
			hotkeys: { action }
		}) );

		// create an array of all possible modifier combinations
		const modifiers = cartesian(
			[ true, false, undefined ],
			[ true, false, undefined ],
			[ true, false, undefined ],
			[ true, false, undefined ]
		)
			// filter out the matching modifier combination
			.filter( ([ a, b, c, d ]) => !( a && b && c && d ) )
			// assign the modifier property names
			.map( ([ altKey, ctrlKey, metaKey, shiftKey ]) => ({
				altKey, ctrlKey, metaKey, shiftKey
			}) );

		await render( hbs`{{component-a}}` );

		await Promise.all( modifiers.map( modifier =>
			triggerEvent( this.element, "keyup", Object.assign( { code: "Escape" }, modifier ) )
		) );
		assert.notOk( action.called, "Doesn't trigger action on non-matching modifiers" );

		await triggerEvent( this.element, "keyup", {
			code: "Escape",
			altKey: true,
			ctrlKey: true,
			metaKey: true,
			shiftKey: true
		});
		assert.ok( action.calledOnce, "Triggers action on matching modifiers" );
	});


	test( "Primary and secondary hotkeys", async function( assert ) {
		this.subject({
			namespace: {
				actions: {
					action: [{
						code: "KeyA"
					}, {
						code: "KeyA",
						ctrlKey: true
					}, {
						code: "KeyB"
					}]
				}
			}
		});
		const action = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespace",
			hotkeys: { action }
		}) );

		await render( hbs`{{component-a}}` );

		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		assert.ok( action.calledOnce, "Executes action on Enter" );
		action.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyA", ctrlKey: true } );
		assert.ok( action.calledOnce, "Executes action on Escape" );
		action.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyB" } );
		assert.notOk( action.called, "Only supports two hotkeys per action" );
	});


	test( "Component siblings with same hotkeys", async function( assert ) {
		this.subject({
			namespace: {
				actions: {
					action: [{
						code: "Enter"
					}]
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();
		const actionC = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespace",
			hotkeys: {
				action: actionA
			}
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespace",
			hotkeys: {
				action: actionB
			}
		}) );
		this.owner.register( "component:component-c", HotkeyComponent.extend({
			hotkeysDisabled: true,
			hotkeysNamespace: "namespace",
			hotkeys: {
				action: actionC
			}
		}) );

		await render( hbs`{{component-a}}{{component-b}}{{component-c}}` );

		await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.notOk( actionA.called, "Doesn't call action on first component" );
		assert.ok( actionB.calledOnce, "Calls action on component inserted last" );
		assert.notOk( actionC.called, "Doesn't call actions on disabled components" );
	});


	test( "Hotkey component removal", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			namespaceOne: {
				actions: {
					action: [{
						code: "Enter"
					}]
				}
			},
			namespaceTwo: {
				actions: {
					action: [{
						code: "Escape"
					}]
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceOne",
			hotkeys: { action: actionA }
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceOne",
			hotkeys: { action: actionB }
		}) );
		this.owner.register( "component:component-c", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceTwo",
			hotkeys: { action: new Function() }
		}) );

		this.set( "shown", false );
		await render( hbs`{{component-a}}{{#if shown}}{{component-b}}{{/if}}{{component-c}}` );

		assert.propEqual(
			service.registries.map( r => r.id ),
			[ "namespaceTwo.action", "namespaceOne.action" ],
			"Has two actions registered"
		);
		assert.strictEqual( service.hotkeys.size, 2, "Has two hotkeys map items" );

		await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.ok( actionA.calledOnce, "Executes action of component A" );
		assert.notOk( actionB.called, "Doesn't execute action of component B" );
		actionA.resetHistory();

		this.set( "shown", true );
		assert.propEqual(
			service.registries.map( r => r.id ),
			[ "namespaceOne.action", "namespaceTwo.action", "namespaceOne.action" ],
			"Has three actions registered now"
		);

		await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.notOk( actionA.called, "Doesn't execute action of component A" );
		assert.ok( actionB.calledOnce, "Executes action of component B" );
		actionB.resetHistory();

		this.set( "shown", false );
		assert.propEqual(
			service.registries.map( r => r.id ),
			[ "namespaceTwo.action", "namespaceOne.action" ],
			"Has two actions registered again"
		);

		await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.ok( actionA.calledOnce, "Executes action of component A" );
		assert.notOk( actionB.called, "Doesn't execute action of component B" );
	});


	test( "Custom hotkeys", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "KeyA"
					}, {
						code: "KeyA",
						ctrlKey: true,
						force: true
					}]
				}
			},
			namespaceB: {
				actions: {
					actionB: [{
						code: "KeyB"
					}]
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA }
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { actionB }
		}) );

		await render( hbs`{{component-a}}{{component-b}}` );

		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		await triggerEvent( this.element, "keyup", { code: "KeyA", ctrlKey: true } );
		assert.ok( actionA.calledTwice, "Calls actionA before settings are loaded" );
		actionA.resetHistory();
		await triggerEvent( this.element, "keyup", { code: "KeyB" } );
		assert.ok( actionB.calledOnce, "Calls actionB before settings are loaded" );
		actionB.resetHistory();

		// new settings with disabled hotkey, overridden hotkeys and new secondary hotkey
		this.owner.lookup( "service:settings" ).content = {
			hotkeys: {
				namespaceA: {
					actionA: {
						primary: {
							disabled: true,
							code: null
						},
						secondary: {
							code: "KeyX",
							altKey: true
						}
					}
				},
				namespaceB: {
					actionB: {
						primary: {},
						secondary: {
							code: "KeyY",
							shiftKey: true
						}
					}
				}
			}
		};

		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		await triggerEvent( this.element, "keyup", { code: "KeyA", ctrlKey: true } );
		assert.notOk( actionA.called, "Doesn't call actionA if disabled or overridden" );
		await triggerEvent( this.element, "keyup", { code: "KeyX", altKey: true } );
		assert.ok( actionA.calledOnce, "Calls actionA with new secondary hotkey" );
		assert.ok( service.hotkeys.get( "namespaceA.actionA" )[1].force, "Still has force flag" );
		actionA.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyB" } );
		await triggerEvent( this.element, "keyup", { code: "KeyY", shiftKey: true } );
		assert.ok( actionB.calledTwice, "Calls actionB with old primary and new secondary hotkey" );
		actionB.resetHistory();

		// new settings with null code, empty secondary and missing namespaceB
		this.owner.lookup( "service:settings" ).content = {
			hotkeys: {
				namespaceA: {
					actionA: {
						primary: {
							code: null
						},
						secondary: {}
					}
				}
			}
		};

		await triggerEvent( this.element, "keyup", { code: "KeyX", altKey: true } );
		assert.notOk( actionA.called, "Has reset old custom hotkey of actionA" );
		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		await triggerEvent( this.element, "keyup", { code: "KeyA", ctrlKey: true } );
		assert.ok( actionA.calledTwice, "Resets actionA with regular and empty user data" );
		actionA.resetHistory();
		assert.ok( service.hotkeys.get( "namespaceA.actionA" )[1].force, "Still has force flag" );

		await triggerEvent( this.element, "keyup", { code: "KeyY", shiftKey: true } );
		assert.notOk( actionB.called, "Has reset secondary hotkey of actionB" );
		await triggerEvent( this.element, "keyup", { code: "KeyB" } );
		assert.ok( actionB.calledOnce, "Calls actionB with default hotkey" );
	});


	test( "Hotkey aliases", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			namespaceA: {
				actions: {
					actionA: "namespaceA.actionB",
					actionB: [{
						code: "Enter"
					}]
				}
			},
			namespaceB: {
				actions: {
					actionC: "namespaceA.actionA"
				}
			},
			namespaceC: {
				actions: {
					actionD: "namespaceA.invalid",
					actionE: "invalid.invalid",
					actionF: "namespaceC.actionG",
					actionG: "namespaceC.actionF"
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();
		const actionC = sinon.spy();
		const noop = new Function();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA, actionB }
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { actionC }
		}) );
		this.owner.register( "component:component-c", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceC",
			hotkeys: { actionD: noop, actionE: noop, actionF: noop, actionG: noop }
		}) );

		await render( hbs`{{component-a}}{{component-b}}` );

		assert.strictEqual(
			service.hotkeys.get( "namespaceA.actionB" )[ 0 ].code,
			"Enter",
			"Regular hotkey has correct code"
		);
		assert.strictEqual(
			service.hotkeys.get( "namespaceA.actionA" )[ 0 ].code,
			"Enter",
			"Has resolved simple hotkey alias"
		);
		assert.strictEqual(
			service.hotkeys.get( "namespaceB.actionC" )[ 0 ].code,
			"Enter",
			"Has resolved nested hotkey alias"
		);
		assert.notOk( service.hotkeys.get( "namespaceC.actionD" ), "Rejects invalid aliases" );
		assert.notOk( service.hotkeys.get( "namespaceC.actionE" ), "Rejects invalid aliases" );
		assert.notOk( service.hotkeys.get( "namespaceC.actionF" ), "Rejects recursive aliases" );
		assert.notOk( service.hotkeys.get( "namespaceC.actionG" ), "Rejects recursive aliases" );

		await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.notOk( actionA.called, "Doesn't call actionA" );
		assert.notOk( actionB.called, "Doesn't call actionB" );
		assert.ok( actionC.calledOnce, "Calls actionC" );

		// try to change all hotkeys, also aliased ones
		this.owner.lookup( "service:settings" ).content = {
			hotkeys: {
				namespaceA: {
					actionA: {
						primary: {
							code: "KeyA"
						}
					},
					actionB: {
						primary: {
							code: "KeyB"
						}
					}
				},
				namespaceB: {
					actionC: {
						primary: {
							code: "KeyC"
						}
					}
				}
			}
		};

		assert.strictEqual(
			service.hotkeys.get( "namespaceA.actionA" )[ 0 ].code,
			"KeyB",
			"Alias hotkeys can't be overridden with user data"
		);
		assert.strictEqual(
			service.hotkeys.get( "namespaceB.actionC" )[ 0 ].code,
			"KeyB",
			"Alias hotkeys can't be overridden with user data"
		);

		// reset
		this.owner.lookup( "service:settings" ).content = {
			hotkeys: {}
		};

		assert.strictEqual(
			service.hotkeys.get( "namespaceA.actionB" )[ 0 ].code,
			"Enter",
			"Regular hotkey has reset to correct code"
		);
		assert.strictEqual(
			service.hotkeys.get( "namespaceA.actionA" )[ 0 ].code,
			"Enter",
			"Simple hotkey alias has reset"
		);
		assert.strictEqual(
			service.hotkeys.get( "namespaceB.actionC" )[ 0 ].code,
			"Enter",
			"Nested hotkey alias has reset"
		);
	});


	test( "Component subclasses with duplicate hotkeys", async function( assert ) {
		/** @type {HotkeyService} */
		const service = this.subject({
			parent: {
				actions: {
					actionA: [{
						code: "KeyA"
					}],
					actionB: [{
						code: "KeyB"
					}]
				}
			},
			child: {
				actions: {
					actionA: "parent.actionA",
					actionC: [{
						code: "KeyC"
					}]
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();
		const actionAChild = sinon.spy();
		const actionC = sinon.spy();

		const ParentComponent = HotkeyComponent.extend({
			hotkeysNamespace: "parent",
			hotkeys: { actionA, actionB }
		});
		const ChildComponent = ParentComponent.extend({
			hotkeysNamespace: "child",
			hotkeys: { actionA: actionAChild, actionC }
		});

		this.owner.register( "component:component-a", ChildComponent );

		await render( hbs`{{component-a}}` );

		assert.propEqual(
			service.registries.map( r => r.id ),
			[ "child.actionA", "parent.actionB", "child.actionC" ],
			"Has registries for merged actions in correct order"
		);

		await triggerEvent( this.element, "keyup", { code: "KeyA" } );
		assert.notOk( actionA.called, "Doesn't call actionA on KeyA" );
		assert.notOk( actionB.called, "Doesn't call actionB on KeyA" );
		assert.ok( actionAChild.calledOnce, "Calls actionAChild on KeyA" );
		assert.notOk( actionB.called, "Doesn't call actionC on KeyA" );
		actionAChild.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyB" } );
		assert.notOk( actionA.called, "Doesn't call actionA on KeyB" );
		assert.ok( actionB.calledOnce, "Calls actionB on KeyB" );
		assert.notOk( actionAChild.called, "Doesn't call actionAChild on KeyB" );
		assert.notOk( actionC.called, "Doesn't call actionC on KeyB" );
		actionB.resetHistory();

		await triggerEvent( this.element, "keyup", { code: "KeyC" } );
		assert.notOk( actionA.called, "Doesn't call actionA on KeyC" );
		assert.notOk( actionB.called, "Doesn't call actionB on KeyC" );
		assert.notOk( actionAChild.called, "Doesn't call actionAChild on KeyC" );
		assert.ok( actionC.calledOnce, "Calls actionC on KeyC" );
	});


	test( "Event bubbling", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "Escape"
					}],
					actionB: [{
						code: "Enter"
					}]
				}
			},
			namespaceB: {
				actions: {
					actionC: [{
						code: "Escape"
					}]
				}
			}
		});

		const actionA = sinon.stub();
		const actionB = sinon.stub().returns( true );
		const actionC = sinon.stub();
		let e;

		const componentA = HotkeyComponent.extend({
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA, actionB }
		});

		const componentB = HotkeyComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { actionC }
		});

		this.owner.register( "component:component-a", componentA );
		this.owner.register( "component:component-b", componentB );

		await render( hbs`{{component-a}}{{component-b}}` );

		e = await triggerEvent( this.element, "keyup", { code: "Escape" } );
		assert.ok( isDefaultPrevented( e ), "Prevents event's default action" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops event's propagation" );
		assert.notOk( actionA.called, "Doesn't call actionA" );
		assert.notOk( actionB.called, "Doesn't call actionB" );
		assert.ok( actionC.calledOnce, "Calls actionC" );
		actionC.resetHistory();

		actionC.returns( true );

		e = await triggerEvent( this.element, "keyup", { code: "Escape" } );
		assert.ok( isDefaultPrevented( e ), "Prevents event's default action" );
		assert.ok( isImmediatePropagationStopped( e ), "Stops event's propagation" );
		assert.ok( actionA.calledOnce, "Calls actionA" );
		assert.notOk( actionB.called, "Doesn't call actionB" );
		assert.ok( actionC.calledOnce, "Calls actionC" );
		actionA.resetHistory();
		actionC.resetHistory();

		e = await triggerEvent( this.element, "keyup", { code: "Enter" } );
		assert.notOk( isDefaultPrevented( e ), "Doesn't prevent event's default action" );
		assert.notOk( isImmediatePropagationStopped( e ), "Doesn't stop event's propagation" );
		assert.notOk( actionA.calledOnce, "Doesn't actionA" );
		assert.ok( actionB.called, "Calls actionB" );
		assert.notOk( actionC.calledOnce, "Doesn't call actionC" );
	});


	test( "Focus on special DOM elements", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					action: [{
						code: "KeyA"
					}]
				}
			},
			namespaceB: {
				actions: {
					action: [{
						code: "KeyB",
						force: true
					}]
				}
			}
		});
		const actionA = sinon.spy();
		const actionB = sinon.spy();

		this.owner.register( "component:component-a", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceA",
			hotkeys: { action: actionA }
		}) );
		this.owner.register( "component:component-b", HotkeyComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { action: actionB }
		}) );

		await render( hbs`<input type="text">{{component-a}}{{component-b}}` );
		const input = this.element.querySelector( "input" );

		await focus( input );

		await triggerEvent( input, "keyup", { code: "KeyA" } );
		assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
		assert.notOk( actionB.called, "Doesn't execute actions when an input element is focused" );

		await triggerEvent( input, "keyup", { code: "KeyB" } );
		assert.notOk( actionA.called, "Doesn't execute actions when an input element is focused" );
		assert.ok( actionB.calledOnce, "Executes actions when the force flag is set" );
	});


	test( "HotkeyComponent title", async function( assert ) {
		this.subject({
			namespaceA: {
				actions: {
					actionA: [{
						code: "Enter"
					}, {
						code: "Enter",
						ctrlKey: true
					}],
					actionB: [{
						code: "KeyB",
						altKey: true,
						ctrlKey: true
					}],
					actionC: [{
						code: "Escape",
						altKey: true,
						ctrlKey: true,
						metaKey: true,
						shiftKey: true
					}],
					actionD: "namespaceA.actionA",
					actionE: [{
						code: "Space"
					}]
				}
			},
			namespaceB: {
				actions: {
					actionE: [{
						code: "ArrowDown"
					}]
				}
			}
		});
		const noop = new Function();
		const getTitle = () => this.element.firstElementChild.title;

		const i18n = this.owner.lookup( "service:i18n" );
		i18n.addTranslations( "en", {
			"hotkeys.codes.Escape": "Esc",
			"hotkeys.codes.ArrowDown": "Down"
		});

		const ParentComponent = HotkeyComponent.extend({
			attributeBindings: [ "title" ],
			hotkeysNamespace: "namespaceA",
			hotkeys: { actionA: noop, actionB: noop, actionC: noop, actionD: noop }
		});

		const ChildComponent = ParentComponent.extend({
			hotkeysNamespace: "namespaceB",
			hotkeys: { actionE: noop }
		});

		this.owner.register( "component:component-a", ChildComponent );

		this.setProperties({
			title: "foo",
			disabled: true,
			action: null
		});
		await render(
			hbs`{{component-a _title=title hotkeysDisabled=disabled hotkeysTitleAction=action}}`
		);

		assert.strictEqual( getTitle(), "foo", "Returns default title if disabled" );

		this.setProperties({
			title: "",
			disabled: false
		});
		assert.strictEqual( getTitle(), "", "Title is empty" );

		this.set( "title", "foo" );
		assert.strictEqual(
			getTitle(),
			"[Enter] foo",
			"Has title with primary hotkey"
		);

		this.set( "action", "actionB" );
		assert.strictEqual(
			getTitle(),
			"[hotkeys.modifiers.ctrlKey+hotkeys.modifiers.altKey+B] foo",
			"Custom action title with multiple modifiers and special code mapping"
		);

		this.set( "action", "actionC" );
		assert.strictEqual(
			getTitle(),
			"[hotkeys.modifiers.ctrlKey+hotkeys.modifiers.shiftKey+"
			+ "hotkeys.modifiers.metaKey+hotkeys.modifiers.altKey+Esc] foo",
			"Custom action with all modifiers and translated code"
		);

		this.set( "action", "actionD" );
		assert.strictEqual(
			getTitle(),
			"[Enter] foo",
			"Has title with primary aliased hotkey"
		);

		this.set( "action", "invalid" );
		assert.strictEqual( getTitle(), "foo", "Just returns title if no hotkey was found" );

		this.setProperties({
			action: "actionA",
			title: i18n.t( "some.translation", { a: "1" } )
		});
		assert.strictEqual(
			getTitle(),
			"[Enter] some.translation{\"a\":\"1\"}",
			"Properly supports i18n SafeStrings"
		);

		this.setProperties({
			action: "actionE",
			title: "foo"
		});
		assert.strictEqual(
			getTitle(),
			"[Down] foo",
			"Uses hotkey of top-most namespace"
		);

		this.owner.lookup( "service:settings" ).content = {
			hotkeys: {
				namespaceB: {
					actionE: {
						primary: {
							disabled: true
						}
					}
				}
			}
		};

		this.set( "title", "bar" );
		assert.strictEqual(
			getTitle(),
			"[Space] bar",
			"Finds the first existing and enabled hotkey in namespace stack"
		);

		i18n.addTranslations( "en", { "hotkeys.codes.Space": "Spacebar" } );
		run( () => i18n.notifyPropertyChange( "locale" ) );
		assert.strictEqual( getTitle(), "[Spacebar] bar", "Reacts to locale changes" );
	});

});
