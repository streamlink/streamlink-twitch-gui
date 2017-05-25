import {
	module,
	test
} from "qunit";
import {
	get,
	setOwner,
	inject,
	run,
	HTMLBars,
	Component
} from "ember";
import {
	buildOwner,
	runDestroy,
	runAppend,
	cleanOutput
} from "test-utils";
import ModalService from "services/ModalService";
import ModalServiceComponent from "components/modal/ModalServiceComponent";


const { service } = inject;
const { compile } = HTMLBars;


let owner, context;


module( "services/ModalService", {
	beforeEach() {
		owner = buildOwner();
		owner.register( "service:modal", ModalService );
		owner.register( "component:modal-service", ModalServiceComponent );
	},

	afterEach() {
		//noinspection JSUnusedAssignment
		runDestroy( context );
		runDestroy( owner );
		owner = context = null;
	}
});


test( "ModalService", assert => {

	assert.expect( 14 );

	const modalService = owner.lookup( "service:modal" );
	owner.register( "component:modal-foo", Component.extend() );

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


test( "ModalServiceComponent", assert => {

	const modalService = owner.lookup( "service:modal" );
	owner.register( "component:modal-foo", Component.extend({
		modal: service(),
		layout: compile( "{{modal.context.foo}}" )
	}) );
	owner.register( "component:modal-bar", Component.extend({
		modal: service(),
		layout: compile( "{{modal.context.bar}}" )
	}) );

	const contextFoo = { foo: "foo" };
	const contextBar = { bar: "bar" };

	context = Component.extend({
		layout: compile( "{{modal-service}}" )
	}).create();
	setOwner( context, owner );

	runAppend( context );

	assert.strictEqual( cleanOutput( context ), "", "Doesn't show a modal dialog initially" );

	run( () => modalService.openModal( "foo", contextFoo ) );
	assert.ok( get( modalService, "isModalOpened" ), "The foo modal is opened" );
	assert.strictEqual( cleanOutput( context ), "foo", "Shows the foo modal" );

	run( () => modalService.closeModal( contextFoo ) );
	assert.notOk( get( modalService, "isModalOpened" ), "The foo modal is closed" );
	assert.strictEqual( cleanOutput( context ), "", "Doesn't show the foo modal anymore" );

	run( () => modalService.openModal( "bar", contextBar ) );
	assert.ok( get( modalService, "isModalOpened" ), "The bar modal is opened" );
	assert.strictEqual( cleanOutput( context ), "bar", "Shows the bar modal" );

	run( () => modalService.openModal( "foo", contextFoo ) );
	assert.ok( get( modalService, "isModalOpened" ), "The foo modal is opened again" );
	assert.strictEqual( cleanOutput( context ), "foo", "Shows the foo modal again" );

});
