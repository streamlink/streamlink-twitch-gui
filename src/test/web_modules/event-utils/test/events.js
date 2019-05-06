import { module, test } from "qunit";
import {
	stubDOMEvents,
	getListeners,
	hasListener,
	isDefaultPrevented,
	isPropagationStopped,
	isImmediatePropagationStopped
} from "../events";
import sinon from "sinon";


module( "event-utils/events", function( hooks ) {
	const testing = document.body.querySelector( "#ember-testing" );

	stubDOMEvents( hooks );

	hooks.beforeEach(function() {
		// root
		// + a
		// | + c
		// |   + d
		// + b
		this.a = document.createElement( "p" );
		this.b = document.createElement( "p" );
		this.c = document.createElement( "p" );
		this.d = document.createElement( "p" );
		testing.appendChild( this.a );
		testing.appendChild( this.b );
		this.a.appendChild( this.c );
		this.c.appendChild( this.d );
	});

	hooks.afterEach( function() {
		this.c.removeChild( this.d );
		this.a.removeChild( this.c );
		testing.removeChild( this.a );
		testing.removeChild( this.b );
		this.a = this.b = this.c = this.d = null;
	});


	test( "getListeners", function( assert ) {
		const a = new Function();
		const b = new Function();
		const c = new Function();
		const d = new Function();
		this.a.addEventListener( "mouseUp", a );
		this.a.addEventListener( "mouseUp", b );
		this.a.addEventListener( "mouseDown", c );
		this.a.addEventListener( "mouseDown", d );
		assert.propEqual(
			getListeners( this.a ),
			[
				{ name: "mouseUp", handler: a },
				{ name: "mouseUp", handler: b },
				{ name: "mouseDown", handler: c },
				{ name: "mouseDown", handler: d }
			],
			"Returns all listeners"
		);
		assert.propEqual(
			getListeners( this.a, "mouseDown" ),
			[
				{ name: "mouseDown", handler: c },
				{ name: "mouseDown", handler: d }
			],
			"Returns all listeners filtered by event name"
		);
	});

	test( "hasListener", function( assert ) {
		const listener = new Function();
		this.a.addEventListener( "click", listener );
		assert.ok(
			hasListener( this.a, "click", listener ),
			"Element A has click listener attached"
		);
		assert.ok(
			hasListener( this.a, "click" ),
			"Element A has unknown click listeners attached"
		);
		assert.ok(
			hasListener( this.a ),
			"Element A has unknown event listeners attached"
		);
		assert.notOk(
			hasListener( this.a, "click", listener, true ),
			"Element A does not have click listener attached in capture phase"
		);
		assert.notOk(
			hasListener( this.a, "click", new Function() ),
			"Element A does not have the other click listener attached"
		);
		assert.notOk(
			hasListener( this.a, "mouseDown", listener ),
			"Element A does not have mouseDown listener attached"
		);
		assert.notOk(
			hasListener( this.b, "click", listener ),
			"Element B does not have click listener attached"
		);

		this.a.dispatchEvent( new MouseEvent( "click" ) );
		assert.ok(
			hasListener( this.a, "click", listener ),
			"Element A still has click listener attached"
		);

		this.a.removeEventListener( "click", listener );
		assert.notOk(
			hasListener( this.a, "click", listener ),
			"Element A does not have click listener attached anymore"
		);
		assert.notOk(
			hasListener( this.a, "click" ),
			"Element A does not have unknown click listeners attached anymore"
		);
		assert.notOk(
			hasListener( this.a ),
			"Element A does not have unknown event listeners attached anymore"
		);
	});

	test( "Multiple listeners", function( assert ) {
		const a = new Function();
		const b = new Function();

		this.a.addEventListener( "click", a );
		this.a.addEventListener( "click", a );
		this.a.addEventListener( "click", b );
		this.a.addEventListener( "click", b );
		assert.ok(
			hasListener( this.a, "click", a ),
			"Element A has click listener A attached"
		);
		assert.ok(
			hasListener( this.a, "click", b ),
			"Element A has click listener B attached"
		);
		assert.ok(
			hasListener( this.a, "click" ),
			"Element A has unknown click listeners attached"
		);
		assert.ok(
			hasListener( this.a ),
			"Element A has unknown event listeners attached"
		);

		this.a.removeEventListener( "click", a );
		assert.notOk(
			hasListener( this.a, "click", a ),
			"Element A does not have click listener A attached anymore"
		);
		assert.ok(
			hasListener( this.a, "click", b ),
			"Element A still has click listener B attached"
		);
		assert.ok(
			hasListener( this.a, "click" ),
			"Element A still has unknown click listeners attached"
		);
		assert.ok(
			hasListener( this.a ),
			"Element A still has unknown event listeners attached"
		);

		this.a.removeEventListener( "click", b );
		assert.notOk(
			hasListener( this.a, "click", a ),
			"Element A does not have click listener A attached anymore"
		);
		assert.notOk(
			hasListener( this.a, "click", b ),
			"Element A still has click listener B attached"
		);
		assert.notOk(
			hasListener( this.a, "click" ),
			"Element A does not have unknown click listeners attached anymore"
		);
		assert.notOk(
			hasListener( this.a ),
			"Element A does not have unknown event listeners attached anymore"
		);
	});

	test( "Capture phase", function( assert ) {
		const listener = new Function();
		this.a.addEventListener( "click", listener, true );
		assert.notOk(
			hasListener( this.a, "click", listener ),
			"Element A does not have click listener attached"
		);
		assert.ok(
			hasListener( this.a, "click", listener, true ),
			"Element A has click listener attached in capture phase"
		);

		this.a.dispatchEvent( new MouseEvent( "click" ) );
		assert.ok(
			hasListener( this.a, "click", listener, true ),
			"Element A still has click listener attached"
		);

		this.a.removeEventListener( "click", listener, true );
		assert.notOk(
			hasListener( this.a, "click", listener, true ),
			"Element A does not have click listener attached anymore in capture phase"
		);
	});

	test( "Once", function( assert ) {
		const listener = new Function();
		this.a.addEventListener( "click", new Function() );

		this.a.addEventListener( "click", listener, { once: true } );
		assert.ok(
			hasListener( this.a, "click", listener ),
			"Element A has click listener attached"
		);
		this.a.dispatchEvent( new MouseEvent( "click" ) );
		assert.notOk(
			hasListener( this.a, "click", listener ),
			"Element A does not have click listener attached anymore"
		);

		this.a.addEventListener( "click", listener, { once: true, capture: true } );
		assert.ok(
			hasListener( this.a, "click", listener, true ),
			"Element A has click listener attached in capture phase"
		);
		this.a.dispatchEvent( new MouseEvent( "click" ) );
		assert.notOk(
			hasListener( this.a, "click", listener, true ),
			"Element A does not have click listener attached anymore in capture phase"
		);
	});

	test( "Once on ancestor elements", function( assert ) {
		const listener = new Function();
		this.a.addEventListener( "click", listener, { once: true, capture: true } );
		this.c.addEventListener( "click", listener, { once: true } );
		assert.ok( hasListener( this.a, "click", listener, true ) );
		assert.ok( hasListener( this.c, "click", listener ) );
		this.d.dispatchEvent( new MouseEvent( "click", { bubbles: true } ) );
		assert.notOk( hasListener( this.a, "click", listener, true ) );
		assert.notOk( hasListener( this.c, "click", listener ) );
	});

	test( "Event context and arguments", function( assert ) {
		const listener = sinon.spy();
		const event = new MouseEvent( "click", { bubbles: true } );
		this.a.addEventListener( "click", listener );
		this.c.addEventListener( "click", listener );
		this.d.addEventListener( "click", listener );
		this.d.dispatchEvent( event );
		assert.ok(
			listener.calledThrice,
			"Event listener was called three times"
		);
		assert.ok(
			listener.alwaysCalledWithExactly( event ),
			"All calls have the event as argument"
		);
		assert.propEqual(
			listener.thisValues,
			[ this.d, this.c, this.a ],
			"All listener contexts are correct"
		);
	});

	test( "isDefaultPrevented", function( assert ) {
		const a = new MouseEvent( "click", { cancelable: true } );
		const b = new MouseEvent( "click", { cancelable: true } );
		this.a.addEventListener( "click", e => e === a ? e.preventDefault() : e );
		this.a.dispatchEvent( a );
		this.a.dispatchEvent( b );
		assert.ok( isDefaultPrevented( a ), "Default is prevented on first event" );
		assert.notOk( isDefaultPrevented( b ), "Default is not prevented on second event" );
	});

	test( "isPropagationStopped", function( assert ) {
		const spy = sinon.spy();
		const a = new MouseEvent( "click", { bubbles: true } );
		const b = new MouseEvent( "click", { bubbles: true } );
		this.a.addEventListener( "click", spy );
		this.d.addEventListener( "click", e => e === a ? e.stopPropagation() : e );

		this.d.dispatchEvent( a );
		assert.ok( isPropagationStopped( a ), "Propagation of first event stopped" );
		assert.notOk( spy.called, "Propagation of first event has been stopped" );

		this.d.dispatchEvent( b );
		assert.notOk( isPropagationStopped( b ), "Propagation of second event not stopped" );
		assert.ok( spy.called, "Propagation of second event has not been stopped" );
	});

	test( "isImmediatePropagationStopped", function( assert ) {
		const spy = sinon.spy();
		const a = new MouseEvent( "click" );
		const b = new MouseEvent( "click" );
		this.a.addEventListener( "click", e => e === a ? e.stopImmediatePropagation() : e );
		this.a.addEventListener( "click", spy );

		this.a.dispatchEvent( a );
		assert.ok(
			isImmediatePropagationStopped( a ),
			"Immediate propagation of first event stopped"
		);
		assert.notOk( spy.called, "Immediate propagation of first event has been stopped" );

		this.a.dispatchEvent( b );
		assert.notOk(
			isImmediatePropagationStopped( b ),
			"Immediate propagation of second event not stopped"
		);
		assert.ok( spy.called, "Immediate propagation of second event has not been stopped" );
	});
});
