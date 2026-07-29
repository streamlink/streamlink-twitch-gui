import { module, test } from "qunit";
import { EventEmitter } from "events";
import sinon from "sinon";

import launchInjector from "inject-loader!services/chat/launch";


module( "services/chat/launch", {
	beforeEach() {
		this.child = new EventEmitter();
		this.child.unref = () => {};

		this.spawn = sinon.stub();
		this.spawn.returns( this.child );
		this.unref = sinon.stub( this.child, "unref" );
		this.nextTick = sinon.stub();

		const { default: launch } = launchInjector({
			child_process: {
				spawn: this.spawn
			},
			process: {
				nextTick: this.nextTick
			}
		});

		this.subject = launch;
	}
});


test( "Reject when spawn throws", async function( assert ) {

	this.spawn.throws( new Error( "throw" ) );

	await assert.rejects(
		async () => await this.subject( "foo", [ "bar", "baz" ] ),
		new Error( "throw" )
	);

	assert.propEqual(
		this.spawn.getCall(0).args,
		[
			"foo",
			[ "bar", "baz" ],
			{
				detached: true,
				stdio: "ignore"
			}
		],
		"Calls spawn with correct parameters"
	);

});


test( "Rejects on error", async function( assert ) {

	assert.expect( 4 );

	await assert.rejects( async () => {
		const promise = this.subject();
		assert.strictEqual( this.child.listenerCount( "error" ), 1, "Child has an error listener" );
		this.child.emit( "error", new Error( "error" ) );
		await promise;
	}, new Error( "error" ) );

	assert.ok( this.unref.calledOnce, "Calls child.unref" );
	assert.ok( this.nextTick.calledOnce, "Has called nextTick" );

});


test( "Resolves on nextTick", async function( assert ) {

	const promise = this.subject();
	this.nextTick.yield();
	await promise;

	assert.ok( this.unref.calledOnce, "Calls child.unref" );
	assert.ok( this.nextTick.calledOnce, "Has called nextTick" );

});
