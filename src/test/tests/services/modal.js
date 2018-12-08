import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver, cleanOutput } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";
import { run } from "@ember/runloop";
import { inject as service } from "@ember/service";

import ModalService from "services/modal";
import ModalServiceComponent from "ui/components/modal/modal-service/component";


module( "services/modal", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			ModalServiceComponent,
			ModalService
		})
	});


	test( "ModalService", async function( assert ) {
		const modalService = this.owner.lookup( "service:modal" );
		this.owner.register( "component:modal-foo", Component.extend() );

		let context;
		const onClose = sinon.spy();
		const onOpen = sinon.spy();

		assert.notOk( modalService.isModalOpened, "No modal is opened initially" );

		context = { foo: 1 };
		modalService.on( "close", onClose );

		modalService.closeModal( null );
		modalService.closeModal( {} );
		assert.notOk(
			onClose.called,
			"Doesn't trigger onClose callbacks if there is no modal opened"
		);

		modalService.one( "open", onOpen );
		modalService.openModal( "foo", context, { bar: 2 } );
		assert.ok( modalService.isModalOpened, "The modal is opened now" );
		assert.propEqual(
			onOpen.args,
			[[
				"modal-foo",
				{ foo: 1, bar: 2 }
			]],
			"onOpen callback has the correct modal and context parameters"
		);
		assert.strictEqual(
			modalService.modal,
			"modal-foo",
			"ModalService has the correct modal property"
		);
		assert.propEqual(
			modalService.context,
			{ foo: 1, bar: 2 },
			"ModalService has the correct context property"
		);

		modalService.closeModal( {} );
		assert.notOk(
			onClose.called,
			"Doesn't close the modal if called with a different context"
		);

		modalService.closeModal( context );
		assert.notOk( modalService.isModalOpened, "The modal is not opened anymore" );
		assert.propEqual(
			onClose.args,
			[[
				"modal-foo",
				{ foo: 1, bar: 2 }
			]],
			"onClose callback has the correct modal and context parameters"
		);
		assert.strictEqual(
			modalService.modal,
			null,
			"ModalService doesn't have a modal property anymore"
		);
		assert.strictEqual(
			modalService.context,
			null,
			"ModalService doesn't have a context property anymore"
		);
		onClose.resetHistory();

		modalService.closeModal( null );
		modalService.closeModal( {} );
		assert.notOk(
			onClose.called,
			"Doesn't trigger onClose callbacks if there is no modal opened"
		);

		modalService.openModal( "foo", context );
		assert.ok( modalService.isModalOpened, "The modal is opened again" );
		modalService.closeModal( null, true );
		assert.ok( onClose.called, "Force closes the modal without context" );

		assert.throws( () => {
			modalService.openModal( "bar", {} );
		}, Error, "Modal component 'bar' does not exist" );
	});


	test( "ModalServiceComponent", async function( assert ) {
		const modalService = this.owner.lookup( "service:modal" );

		this.owner.register( "component:modal-foo", Component.extend({
			modal: service(),
			layout: hbs`{{modal.context.foo}}`
		}) );
		this.owner.register( "component:modal-bar", Component.extend({
			modal: service(),
			layout: hbs`{{modal.context.bar}}`
		}) );

		const contextFoo = { foo: "foo" };
		const contextBar = { bar: "bar" };

		await render( hbs`{{modal-service}}` );

		assert.strictEqual( cleanOutput( this ), "", "Doesn't show a modal dialog initially" );

		run( () => modalService.openModal( "foo", contextFoo ) );
		assert.ok( modalService.isModalOpened, "The foo modal is opened" );
		assert.strictEqual( cleanOutput( this ), "foo", "Shows the foo modal" );

		run( () => modalService.closeModal( contextFoo ) );
		assert.notOk( modalService.isModalOpened, "The foo modal is closed" );
		assert.strictEqual( cleanOutput( this ), "", "Doesn't show the foo modal anymore" );

		run( () => modalService.openModal( "bar", contextBar ) );
		assert.ok( modalService.isModalOpened, "The bar modal is opened" );
		assert.strictEqual( cleanOutput( this ), "bar", "Shows the bar modal" );

		run( () => modalService.openModal( "foo", contextFoo ) );
		assert.ok( modalService.isModalOpened, "The foo modal is opened again" );
		assert.strictEqual( cleanOutput( this ), "foo", "Shows the foo modal again" );
	});

});
