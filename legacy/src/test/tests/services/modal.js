import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { triggerEvent } from "event-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { run } from "@ember/runloop";

import ModalService from "services/modal";
import ModalServiceComponent from "ui/components/modal/modal-service/component";
import modalDialogComponentInjector
	from "inject-loader?ui/components/-mixins/hotkey!ui/components/modal/modal-dialog/component";


module( "services/modal", function( hooks ) {
	const { default: ModalDialogComponent } = modalDialogComponentInjector({
		"ui/components/-mixins/hotkey": {}
	});

	setupRenderingTest( hooks, {
		resolver: buildResolver({
			ModalServiceComponent,
			ModalService
		})
	});

	hooks.beforeEach(function() {
		const FakeModalDialogComponent = ModalDialogComponent.extend({
			layout: hbs`[{{this.modalName}}:{{this.modalContext.value}}]`
		});
		this.owner.register( "component:modal-foo", FakeModalDialogComponent.extend({
			classNames: [ "modal-foo-component" ]
		}) );
		this.owner.register( "component:modal-bar", FakeModalDialogComponent.extend({
			classNames: [ "modal-bar-component" ]
		}) );

		/** @type {ModalService} */
		this.modalService = this.owner.lookup( "service:modal" );
		this.onOpen = sinon.spy();
		this.onClose = sinon.spy();

		this.modalService.on( "open", this.onOpen );
		this.modalService.on( "close", this.onClose );
	});


	test( "Throws on invalid modal component", function( assert ) {
		const {
			/** @type {ModalService} */ modalService,
			/** @type {SinonSpy} */ onOpen
		} = this;

		assert.throws(
			() => modalService.openModal( "invalid", {} ),
			new Error( "Modal component 'modal-invalid' does not exist" ),
			"Throws on invalid modal component"
		);
		assert.throws(
			() => modalService.openModal( "foo", true ),
			new Error( "Missing context object" ),
			"Throws on invalid context"
		);

		assert.notOk( modalService.isModalOpened, "No modal has been opened" );
		assert.notOk( onOpen.called, "Doesn't emit open event" );
	});

	test( "Single modal", async function( assert ) {
		const {
			/** @type {ModalService} */ modalService,
			/** @type {SinonSpy} */ onOpen,
			/** @type {SinonSpy} */ onClose
		} = this;

		const context = { foo: 1 };

		assert.notOk( modalService.isModalOpened, "No modal is opened initially" );

		modalService.closeModal( {} );
		modalService.closeModal( null );
		modalService.closeModal( null, "foo" );
		assert.notOk(
			onClose.called,
			"Doesn't emit close event if there is no modal opened"
		);

		modalService.openModal( "foo", context, { bar: 2 }, 123 );
		assert.ok( modalService.isModalOpened, "A modal is opened now" );
		assert.propEqual( context, { foo: 1, bar: 2 }, "Updates the context" );
		assert.propEqual(
			onOpen.args,
			[[ "foo", { foo: 1, bar: 2 }, 123 ]],
			"onOpen callback has the correct modal and context parameters"
		);
		assert.propEqual(
			Array.from( modalService.modals ),
			[{ name: "foo", context: { foo: 1, bar: 2 }, priority: 123 }],
			"ModalService has the correct modals registered"
		);

		modalService.closeModal();
		modalService.closeModal( {} );
		modalService.closeModal( null, "bar" );
		assert.notOk(
			onClose.called,
			"Doesn't close the modal if called with non-matching data"
		);

		modalService.closeModal( context );
		assert.notOk( modalService.isModalOpened, "Closes the modal by context" );
		assert.propEqual(
			onClose.args,
			[[ "foo", { foo: 1, bar: 2 } ]],
			"onClose callback has the correct modal and context parameters"
		);
		onOpen.resetHistory();
		onClose.resetHistory();

		// open modal without data and priority
		modalService.openModal( "foo", context );
		assert.ok( modalService.isModalOpened, "The modal is opened again" );
		assert.propEqual(
			onOpen.args,
			[[ "foo", { foo: 1, bar: 2 }, 0 ]],
			"Doesn't update the context and sets priority to default value"
		);
		modalService.closeModal( null, "foo" );
		assert.notOk( modalService.isModalOpened, "Closes the modal by name" );
		assert.ok( onClose.calledOnce, "Closes the modal by name" );
		onOpen.resetHistory();
		onClose.resetHistory();

		// open modal without context
		const newContext = modalService.openModal( "foo" );
		assert.ok( modalService.isModalOpened, "The modal is opened again" );
		assert.propEqual(
			onOpen.args,
			[[ "foo", {}, 0 ]],
			"Creates a new context if none was passed"
		);
		modalService.closeModal( newContext, "foo" );
		assert.notOk( modalService.isModalOpened, "Closes the modal by context and name" );
		assert.ok( onClose.calledOnce, "Closes the modal by context and name" );
	});

	test( "Multiple modals with priorities", async function( assert ) {
		const {
			/** @type {ModalService} */ modalService,
			/** @type {SinonSpy} */ onOpen,
			/** @type {SinonSpy} */ onClose
		} = this;

		const contextFooOne = { foo: 1 };
		const contextFooTwo = { foo: 2 };
		const contextBarOne = { bar: 1 };
		const contextBarTwo = { bar: 2 };

		assert.notOk( modalService.isModalOpened, "No modal is opened initially" );

		// add foo modals
		modalService.openModal( "foo", contextFooOne, null, 1 );
		modalService.openModal( "foo", contextFooTwo, null, 2 );
		assert.ok( modalService.isModalOpened, "Modals are opened now" );
		assert.propEqual(
			onOpen.args,
			[
				[ "foo", contextFooOne, 1 ],
				[ "foo", contextFooTwo, 2 ]
			],
			"onOpen callback has the correct modal and context parameters"
		);
		assert.propEqual(
			Array.from( modalService.modals ),
			[
				{ name: "foo", context: contextFooOne, priority: 1 },
				{ name: "foo", context: contextFooTwo, priority: 2 }
			],
			"ModalService has the correct modals registered"
		);
		onOpen.resetHistory();

		// add bar modals
		modalService.openModal( "bar", contextBarOne, null, 0 );
		modalService.openModal( "bar", contextBarTwo, null, 1 );
		assert.propEqual(
			onOpen.args,
			[
				[ "bar", contextBarOne, 0 ],
				[ "bar", contextBarTwo, 1 ]
			],
			"onOpen callback has the correct modal and context parameters"
		);
		assert.propEqual(
			Array.from( modalService.modals ),
			[
				{ name: "bar", context: contextBarOne, priority: 0 },
				{ name: "foo", context: contextFooOne, priority: 1 },
				{ name: "bar", context: contextBarTwo, priority: 1 },
				{ name: "foo", context: contextFooTwo, priority: 2 }
			],
			"Correctly orders new modals by priority"
		);
		onOpen.resetHistory();

		// update modals
		modalService.openModal( "foo", contextFooOne, null, 0 );
		modalService.openModal( "bar", contextBarTwo, null, -1 );
		modalService.openModal( "foo", contextFooTwo, null, 1 );
		modalService.openModal( "bar", contextBarOne, null, 3 );
		assert.notOk( onOpen.called, "Doesn't open the same modal dialogs again" );
		assert.propEqual(
			Array.from( modalService.modals ),
			[
				{ name: "bar", context: contextBarTwo, priority: -1 },
				{ name: "foo", context: contextFooOne, priority: 0 },
				{ name: "foo", context: contextFooTwo, priority: 1 },
				{ name: "bar", context: contextBarOne, priority: 3 }
			],
			"Correctly orders existing modals by priority"
		);

		// remove mutliple modals by name
		modalService.closeModal( null, "foo" );
		assert.ok( modalService.isModalOpened, "Modals still opened" );
		assert.propEqual(
			onClose.args,
			[
				[ "foo", contextFooTwo ],
				[ "foo", contextFooOne ]
			],
			"Closes modals by name and closes them in reverse order"
		);
		assert.propEqual(
			Array.from( modalService.modals ),
			[
				{ name: "bar", context: contextBarTwo, priority: -1 },
				{ name: "bar", context: contextBarOne, priority: 3 }
			],
			"Bar modals are still opened after closing all foo modals"
		);
		onClose.resetHistory();

		// remove remaining modals
		modalService.closeModal( null, "bar" );
		assert.notOk( modalService.isModalOpened, "No modals are opened anymore" );
		assert.propEqual(
			onClose.args,
			[
				[ "bar", contextBarOne ],
				[ "bar", contextBarTwo ]
			],
			"Closes modals by name and closes them in reverse order"
		);
	});

	test( "Promise modal", async function( assert ) {
		const {
			/** @type {ModalService} */ modalService,
			/** @type {SinonSpy} */ onOpen,
			/** @type {SinonSpy} */ onClose
		} = this;

		const contextA = { foo: "a" };
		const contextB = { foo: "b" };

		// add existing modal
		modalService.openModal( "foo", contextA );
		onOpen.resetHistory();

		// promise new modal without context
		const promiseOne = modalService.promiseModal( "foo" )
			.then( () => 1 );
		// promise new modal with all parameters
		const promiseTwo = modalService.promiseModal( "foo", contextB, { bar: "c" }, 1 )
			.then( () => 2 );
		assert.ok( modalService.isModalOpened, "Modals are opened now" );
		assert.propEqual(
			onOpen.args,
			[
				[ "foo", {}, 0 ],
				[ "foo", { foo: "b", bar: "c" }, 1 ]
			],
			"Opens promise-modals with correct parameters"
		);

		modalService.closeModal( contextA );
		assert.ok( modalService.isModalOpened, "Modals are still opened" );
		assert.propEqual(
			onClose.args,
			[[ "foo", contextA ]],
			"First modal has been closed"
		);
		assert.strictEqual(
			await Promise.race([ promiseOne, promiseTwo, Promise.resolve( 0 ) ]),
			0,
			"All promises are still pending"
		);
		onClose.resetHistory();

		// close second promise-modal
		modalService.closeModal( contextB );
		await new Promise( resolve => process.nextTick( resolve ) );
		assert.ok( modalService.isModalOpened, "Modals are still opened" );
		assert.propEqual(
			onClose.args,
			[[ "foo", contextB ]],
			"Second promise-modal has been closed"
		);
		assert.strictEqual(
			await Promise.race([ promiseOne, promiseTwo, Promise.resolve( 0 ) ]),
			2,
			"Second promise has been resolved"
		);
		onClose.resetHistory();

		// close first promise-modal
		modalService.closeModal( null, "foo" );
		await new Promise( resolve => process.nextTick( resolve ) );
		assert.notOk( modalService.isModalOpened, "All modals have been closed" );
		assert.propEqual(
			onClose.args,
			[[ "foo", {} ]],
			"First promise-modal has been closed"
		);
		assert.strictEqual(
			await Promise.race([ promiseOne, promiseTwo, Promise.resolve( 0 ) ]),
			1,
			"All promises have been resolved"
		);

		// remove close event spy
		modalService.off( "close", onClose );
		assert.notOk( modalService.has( "close" ), "Doesn't have close event listeners anymore" );
	});

	test( "hasModal", async function( assert ) {
		const { /** @type {ModalService} */ modalService } = this;

		const contextOne = { foo: 1 };
		const contextTwo = { foo: 2 };

		assert.notOk( modalService.isModalOpened, "No modal is opened initially" );
		assert.notOk( modalService.hasModal( "foo" ), "No foo modal" );
		assert.notOk( modalService.hasModal( "foo", contextOne ), "No foo modal with context" );
		assert.notOk( modalService.hasModal( null, contextTwo ), "No modal with context" );

		modalService.openModal( "foo", contextOne );
		assert.ok( modalService.isModalOpened, "Has modals opened" );
		assert.ok( modalService.hasModal( "foo" ), "Has foo modals" );
		assert.notOk( modalService.hasModal( "bar" ), "No bar modals" );
		assert.ok( modalService.hasModal( "foo", contextOne ), "Has foo modal with contextOne" );
		assert.notOk( modalService.hasModal( "foo", contextTwo ), "No foo modal with contextTwo" );
		assert.ok( modalService.hasModal( null, contextOne ), "Has modal with contextOne" );
		assert.notOk( modalService.hasModal( null, contextTwo ), "No modal with contextTwo" );
	});

	test( "Rendering test", async function( assert ) {
		const { /** @type {ModalService} */ modalService } = this;

		const contextFooOne = { value: 1 };
		const contextFooTwo = { value: 2 };
		const contextBar = { value: 3 };

		const getContent = () =>
			Array.from( this.element.querySelectorAll( ".modal-dialog-component:not(.fadeOut)" ) )
				.map( elem => elem.innerText.replace( /\s+/g, "" ) )
				.join( "" );

		await render( hbs`{{modal-service}}` );
		const wrapper = this.element.querySelector( ".modal-service-component" );
		const replaceChildSpy = sinon.spy( wrapper, "replaceChild" );

		// wrapper
		assert.ok( wrapper instanceof HTMLElement, "Renders wrapper" );
		assert.notOk( wrapper.classList.contains( "active" ), "Is inactive" );
		assert.strictEqual( getContent(), "", "Doesn't show a modal dialog initially" );

		// new foo 1 modal
		run( () => modalService.openModal( "foo", contextFooOne ) );
		assert.ok( modalService.isModalOpened, "A modal is opened now" );
		assert.ok( wrapper.classList.contains( "active" ), "Is active now" );

		// foo 1 rendering
		const modalFooOne = wrapper.querySelector( ".modal-dialog-component" );
		assert.ok( modalFooOne instanceof HTMLElement, "Renders modal dialog" );
		assert.ok( modalFooOne.classList.contains( "modal-foo-component" ), "Has the right class" );
		assert.strictEqual( getContent(), "[foo:1]", "Shows the foo modal one" );

		// new foo 2 modal
		run( () => modalService.openModal( "foo", contextFooTwo ) );
		assert.ok( modalService.isModalOpened, "A modal is still opened" );
		assert.ok( wrapper.classList.contains( "active" ), "Is still active" );

		// foo 2 rendering and re-inserting into DOM
		const modalFooTwo = wrapper.querySelector( ".modal-dialog-component" );
		assert.ok( modalFooTwo instanceof HTMLElement, "Renders modal dialog" );
		assert.ok( modalFooTwo.classList.contains( "modal-foo-component" ), "Has the right class" );
		assert.strictEqual( getContent(), "[foo:2]", "Shows the foo modal two" );
		assert.strictEqual( modalFooOne, modalFooTwo, "Modals with same name share same element" );
		assert.notOk( wrapper.querySelector( ".fadeOut" ), "Doesn't create a fadeOut clone" );
		assert.ok( replaceChildSpy.calledOnce, "Re-inserts element on context change" );
		replaceChildSpy.resetHistory();

		// new bar modal
		run( () => modalService.openModal( "bar", contextBar ) );
		const modalBar = wrapper.querySelector( ".modal-dialog-component:not(.fadeOut)" );
		assert.ok( modalBar instanceof HTMLElement, "Renders modal dialog" );
		assert.ok( modalBar.classList.contains( "modal-bar-component" ), "Has the right class" );
		assert.strictEqual( getContent(), "[bar:3]", "Shows bar modal now" );
		assert.notOk( replaceChildSpy.called, "Doesn't re-insert element on name change" );

		// foo 2 clone
		const modalFooOneClone = wrapper.querySelector( ".modal-dialog-component.fadeOut" );
		assert.ok( modalFooOneClone instanceof HTMLElement, "Foo two has a fadeOut clone" );
		await triggerEvent( modalFooOneClone, "webkitAnimationEnd" );
		assert.notOk( modalFooOneClone.isConnected, "Clone gets removed from DOM after animation" );

		// close foo modals
		run( () => modalService.closeModal( null, "foo" ) );
		assert.ok( modalService.isModalOpened, "A modal is still opened" );
		assert.ok( wrapper.classList.contains( "active" ), "Is still active" );
		assert.strictEqual( getContent(), "[bar:3]", "Only shows the bar modal" );

		// close bar modal
		run( () => modalService.closeModal( contextBar ) );
		assert.notOk( modalService.isModalOpened, "No modal is opened anymore" );
		assert.notOk( wrapper.classList.contains( "active" ), "Is inactive now" );
		assert.strictEqual( getContent(), "", "All modals have been closed" );
	});
});
