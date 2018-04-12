import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, cleanOutput, hbs } from "test-utils";
import Component from "@ember/component";
import { get } from "@ember/object";
import { run } from "@ember/runloop";
import { inject as service } from "@ember/service";

import ModalService from "services/modal";
import ModalServiceComponent from "ui/components/modal/modal-service/component";


moduleForComponent( "services/modal", {
	integration: true,
	resolver: buildResolver({
		ModalServiceComponent,
		ModalService
	})
});


test( "ModalService", function( assert ) {

	assert.expect( 14 );

	const modalService = this.container.lookup( "service:modal" );
	this.registry.register( "component:modal-foo", Component.extend() );

	let context;
	const throwOnClose = () => {
		throw new Error();
	};

	assert.notOk( get( modalService, "isModalOpened" ), "No modal is opened initially" );

	context = { foo: 1 };
	modalService.on( "close", throwOnClose );

	// doesn't trigger onClose callbacks if there is no modal opened
	modalService.closeModal( null );
	modalService.closeModal( {} );

	modalService.one( "open", ( modal, context ) => {
		assert.strictEqual(
			modal,
			"modal-foo",
			"onOpen callback has the correct modal parameter"
		);
		assert.propEqual(
			context,
			{ foo: 1, bar: 2 },
			"onOpen callback has the correct context parameter"
		);
	});
	modalService.openModal( "foo", context, { bar: 2 } );
	assert.ok( get( modalService, "isModalOpened" ), "The modal is opened now" );
	assert.strictEqual(
		get( modalService, "modal" ),
		"modal-foo",
		"ModalService has the correct modal property"
	);
	assert.propEqual(
		get( modalService, "context" ),
		{ foo: 1, bar: 2 },
		"ModalService has the correct context property"
	);

	// doesn't close the modal if called with a different context
	modalService.closeModal( {} );

	modalService.off( "close", throwOnClose );
	modalService.one( "close", ( modal, context ) => {
		assert.strictEqual(
			modal,
			"modal-foo",
			"onClose callback has the correct modal parameter"
		);
		assert.propEqual(
			context,
			{ foo: 1, bar: 2 },
			"onClose callback has the correct context parameter"
		);
	});
	modalService.closeModal( context );
	assert.notOk( get( modalService, "isModalOpened" ), "The modal is not opened anymore" );
	assert.strictEqual(
		get( modalService, "modal" ),
		null,
		"ModalService doesn't have a modal property anymore"
	);
	assert.strictEqual(
		get( modalService, "context" ),
		null,
		"ModalService doesn't have a context property anymore"
	);

	// doesn't trigger onClose callbacks if there is no modal opened
	modalService.on( "close", throwOnClose );
	modalService.closeModal( null );
	modalService.closeModal( {} );
	modalService.off( "close", throwOnClose );

	modalService.one( "close", () => {
		assert.ok( true, "Force closes the modal" );
	});
	modalService.openModal( "foo", context );
	assert.ok( get( modalService, "isModalOpened" ), "The modal is opened again" );
	modalService.closeModal( null, true );

	assert.throws( () => {
		modalService.openModal( "bar", {} );
	}, Error, "Modal component 'bar' does not exist" );

});


test( "ModalServiceComponent", function( assert ) {

	const modalService = this.container.lookup( "service:modal" );
	this.registry.register( "component:modal-foo", Component.extend({
		modal: service(),
		layout: hbs`{{modal.context.foo}}`
	}) );
	this.registry.register( "component:modal-bar", Component.extend({
		modal: service(),
		layout: hbs`{{modal.context.bar}}`
	}) );

	const contextFoo = { foo: "foo" };
	const contextBar = { bar: "bar" };

	this.render( hbs`{{modal-service}}` );

	assert.strictEqual( cleanOutput( this ), "", "Doesn't show a modal dialog initially" );

	run( () => modalService.openModal( "foo", contextFoo ) );
	assert.ok( get( modalService, "isModalOpened" ), "The foo modal is opened" );
	assert.strictEqual( cleanOutput( this ), "foo", "Shows the foo modal" );

	run( () => modalService.closeModal( contextFoo ) );
	assert.notOk( get( modalService, "isModalOpened" ), "The foo modal is closed" );
	assert.strictEqual( cleanOutput( this ), "", "Doesn't show the foo modal anymore" );

	run( () => modalService.openModal( "bar", contextBar ) );
	assert.ok( get( modalService, "isModalOpened" ), "The bar modal is opened" );
	assert.strictEqual( cleanOutput( this ), "bar", "Shows the bar modal" );

	run( () => modalService.openModal( "foo", contextFoo ) );
	assert.ok( get( modalService, "isModalOpened" ), "The foo modal is opened again" );
	assert.strictEqual( cleanOutput( this ), "foo", "Shows the foo modal again" );

});
