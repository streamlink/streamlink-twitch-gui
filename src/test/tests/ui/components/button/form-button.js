import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs } from "test-utils";
import Component from "@ember/component";
import { run } from "@ember/runloop";
import sinon from "sinon";

import {
	default as FormButtonComponent,
	STATE_SUCCESS,
	STATE_FAILURE
} from "ui/components/button/form-button/component";


moduleForComponent( "ui/components/button/form-button", {
	integration: true,
	resolver: buildResolver({
		FormButtonComponent
	}),
	beforeEach() {
		this.registry.register( "component:loading-spinner", Component.extend({
			tagName: "i",
			classNames: "loading-spinner-component"
		}) );
	}
});


test( "Basic attributes", function( assert ) {

	this.setProperties({
		classNames: "foo",
		title: "bar",
		disabled: false,
		icon: "fa-times"
	});
	this.render( hbs`
		{{form-button
			classNames=classNames
			title=title
			disabled=disabled
			icon=icon
		}}
	` );
	const $btn = this.$( ".form-button-component" );

	assert.ok( $btn.get( 0 ) instanceof HTMLButtonElement, "The button exists" );
	assert.ok( $btn.hasClass( "icon" ), "Has non-block button icon class" );
	assert.notOk( $btn.hasClass( "icon-and-text" ), "Doesn't have block button icon class" );
	assert.ok( $btn.hasClass( "foo" ), "Has custom class name applied" );
	assert.strictEqual( $btn.attr( "title" ), "bar", "Has title attribute" );
	assert.strictEqual( $btn.attr( "disabled" ), undefined, "Is not disabled" );
	assert.ok( $btn.find( "i.fa" ).hasClass( "fa-times" ), "Has an icon with correct class name" );

	this.set( "disabled", true );
	assert.strictEqual( $btn.attr( "disabled" ), "disabled", "Button is now disabled" );

});


test( "FormButtonComponent with block", function( assert ) {

	this.render( hbs`{{#form-button icon="fa-times"}}foo{{/form-button}}` );
	const $btn = this.$( ".form-button-component" );

	assert.notOk( $btn.hasClass( "icon" ), "Is not a regular icon button" );
	assert.ok( $btn.hasClass( "icon-and-text" ), "Has block button icon class" );
	assert.strictEqual( $btn.text().trim(), "foo", "Has button block content" );

});


test( "Click actions", function( assert ) {

	let clicks = 0;
	this.on( "action", () => ++clicks );

	this.render( hbs`{{form-button action=(action "action")}}` );
	const $btn = this.$( ".form-button-component" );

	$btn.click();
	assert.strictEqual( clicks, 1, "Executes click actions" );

});


test( "Icon success animation", async function( assert ) {

	let success;
	let successPromise;
	const successPromiseData = {};

	this.on( "action", _success => success = _success );

	this.render( hbs`
		{{form-button
			action=(action "action")
			icon="fa-times"
			iconanim=true
			spinner=true
		}}
	` );
	const $btn = this.$( ".form-button-component" );

	// click and succeed
	success = null;
	$btn.click();

	assert.ok( $btn.hasClass( "animated" ), "Has animation class" );
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		1,
		"Is showing the loading spinner"
	);
	assert.ok( success instanceof Function, "Action has success callback" );

	// let the action succeed
	run( () => successPromise = success( successPromiseData ) );

	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner anymore"
	);
	assert.ok(
		$btn.find( "i.fa" ).hasClass( "anim-success" ),
		"Icon does have the animation success class"
	);

	// let the animation end
	run( () => $btn.trigger( "webkitAnimationEnd" ) );

	assert.notOk( $btn.hasClass( "animated" ), "Button does not have the animation class anymore" );
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner after the success callback has resolved"
	);
	assert.notOk(
		$btn.find( "i.fa" ).hasClass( "anim-success" ),
		"Icon does not have the animation success class anymore"
	);

	assert.strictEqual(
		await successPromise,
		successPromiseData,
		"The success promise always resolves"
	);

});


test( "Icon failure animation", async function( assert ) {

	let failure;
	let failurePromise;
	const failurePromiseData = {};

	this.on( "action", ( _success, _failure ) => failure = _failure );

	this.render( hbs`
		{{form-button
			action=(action "action")
			icon="fa-times"
			iconanim=true
			spinner=true
		}}
	` );
	const $btn = this.$( ".form-button-component" );

	// click and fail
	failure = null;
	$btn.click();

	assert.ok( $btn.hasClass( "animated" ), "Has button animation class" );
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		1,
		"Is showing the loading spinner"
	);
	assert.ok( failure instanceof Function, "Action has failure callback" );

	// let the action fail
	run( () => failurePromise = failure( failurePromiseData ) );

	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner anymore"
	);
	assert.ok(
		$btn.find( "i.fa" ).hasClass( "anim-failure" ),
		"Icon has the animation failure class"
	);

	// let the animation end
	run( () => $btn.trigger( "webkitAnimationEnd" ) );

	assert.notOk(
		$btn.hasClass( "animated" ),
		"Button does not have the animation class anymore"
	);
	assert.strictEqual(
		$btn.find( ".loading-spinner-component" ).length,
		0,
		"Is not showing the loading spinner after the success callback has resolved"
	);
	assert.notOk(
		$btn.find( "i.fa" ).hasClass( "anim-failure" ),
		"Icon does not have the animation failure class anymore"
	);

	await assert.rejects(
		failurePromise,
		failurePromiseData,
		"The failure promise always rejects"
	);

});


test( "Click actions return a Promise", async function( assert ) {

	// can be done in a better way, but works for now
	let successPromise;
	let failurePromise;
	let successResolve;
	let failureReject;
	const successStub = sinon.stub();
	const failureStub = sinon.stub();
	const actionResult = sinon.stub();
	this.on( "action", actionResult );

	this.setProperties({
		icon: "fa-times",
		iconanim: true,
		_iconAnimation() {}
	});
	this.render( hbs`
		{{form-button
			action=(action "action")
			icon="fa-times"
			iconanim=true
			_iconAnimation=_iconAnimation
		}}
	` );
	const $btn = this.$( ".form-button-component" );

	actionResult.resolves( 123 );
	successStub.resolves( successPromise = new Promise( resolve => successResolve = resolve ) );
	this.set( "_iconAnimation", successStub );
	$btn.click();
	successResolve();
	await successPromise;
	assert.propEqual( successStub.args, [ [ STATE_SUCCESS, 123 ] ], "Calls icon success callback" );

	actionResult.rejects( 456 );
	failureStub.rejects( failurePromise = new Promise( ( _, reject ) => failureReject = reject ) );
	this.set( "_iconAnimation", failureStub );
	$btn.click();
	failureReject();
	await assert.rejects( failurePromise );
	assert.propEqual( failureStub.args, [ [ STATE_FAILURE, 456 ] ], "Calls icon failure callback" );

});
