import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render, click, triggerEvent } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";
import { run } from "@ember/runloop";

import {
	default as FormButtonComponent,
	STATE_SUCCESS,
	STATE_FAILURE
} from "ui/components/button/form-button/component";


module( "ui/components/button/form-button", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			FormButtonComponent,
			LoadingSpinnerComponent: Component.extend({
				tagName: "i",
				classNames: "loading-spinner-component"
			})
		})
	});


	test( "Basic attributes", async function( assert ) {
		this.setProperties({
			classNames: "foo",
			title: "bar",
			disabled: false,
			icon: "fa-times"
		});
		await render( hbs`
			{{form-button
				classNames=classNames
				title=title
				disabled=disabled
				icon=icon
			}}
		` );
		const btn = this.element.querySelector( ".form-button-component" );

		assert.ok( btn instanceof HTMLButtonElement, "The button exists" );
		assert.ok( btn.classList.contains( "icon" ), "Has non-block button icon class" );
		assert.notOk(
			btn.classList.contains( "icon-and-text" ),
			"Doesn't have block button icon class"
		);
		assert.ok( btn.classList.contains( "foo" ), "Has custom class name applied" );
		assert.strictEqual( btn.getAttribute( "title" ), "bar", "Has title attribute" );
		assert.notOk( btn.hasAttribute( "disabled" ), "Is not disabled" );
		assert.ok(
			btn.querySelector( "i.fa" ).classList.contains( "fa-times" ),
			"Has an icon with correct class name"
		);

		this.set( "disabled", true );
		assert.ok( btn.hasAttribute( "disabled" ), "Button is now disabled" );
	});


	test( "FormButtonComponent with block", async function( assert ) {
		await render( hbs`{{#form-button icon="fa-times"}}foo{{/form-button}}` );
		const btn = this.element.querySelector( ".form-button-component" );

		assert.notOk( btn.classList.contains( "icon" ), "Is not a regular icon button" );
		assert.ok( btn.classList.contains( "icon-and-text" ), "Has block button icon class" );
		assert.strictEqual( btn.innerText.trim(), "foo", "Has button block content" );
	});


	test( "Click actions", async function( assert ) {
		let clicks = 0;
		this.set( "action", () => ++clicks );

		await render( hbs`{{form-button action=action}}` );
		const btn = this.element.querySelector( ".form-button-component" );

		await click( btn );
		assert.strictEqual( clicks, 1, "Executes click actions" );
	});


	test( "Icon success animation", async function( assert ) {
		/** @type {Function|null} */
		let success;
		const successPromiseData = {};

		this.set( "action", _success => success = _success );

		await render( hbs`
			{{form-button
				action=action
				icon="fa-times"
				iconanim=true
				spinner=true
			}}
		` );
		const btn = this.element.querySelector( ".form-button-component" );

		// click and succeed
		success = null;
		await click( btn );

		assert.ok( btn.classList.contains( "animated" ), "Has animation class" );
		assert.ok(
			btn.querySelector( ".loading-spinner-component" ),
			"Is showing the loading spinner"
		);
		assert.ok( success instanceof Function, "Action has success callback" );

		// let the action succeed
		run( () => success( successPromiseData ).then( data => {
			assert.strictEqual( data, successPromiseData, "Resolves with correct data" );
			assert.step( "success" );
		}) );

		assert.notOk(
			btn.querySelector( ".loading-spinner-component" ),
			"Is not showing the loading spinner anymore"
		);
		assert.ok(
			btn.querySelector( "i.fa" ).classList.contains( "anim-success" ),
			"Icon does have the animation success class"
		);

		// let the animation end
		await triggerEvent( btn, "webkitAnimationEnd" );

		assert.notOk(
			btn.classList.contains( "animated" ),
			"Button does not have the animation class anymore"
		);
		assert.notOk(
			btn.querySelector( ".loading-spinner-component" ),
			"Is not showing the loading spinner after the success callback has resolved"
		);
		assert.notOk(
			btn.querySelector( "i.fa" ).classList.contains( "anim-success" ),
			"Icon does not have the animation success class anymore"
		);

		// noinspection JSUnusedAssignment
		assert.verifySteps(
			[ "success" ],
			"The success promise always resolves"
		);
	});


	test( "Icon failure animation", async function( assert ) {
		/** @type {Function|null} */
		let failure;
		const failurePromiseData = {};

		this.set( "action", ( _success, _failure ) => failure = _failure );

		await render( hbs`
			{{form-button
				action=action
				icon="fa-times"
				iconanim=true
				spinner=true
			}}
		` );
		const btn = this.element.querySelector( ".form-button-component" );

		// click and fail
		failure = null;
		await click( btn );

		assert.ok( btn.classList.contains( "animated" ), "Has button animation class" );
		assert.ok(
			btn.querySelector( ".loading-spinner-component" ),
			"Is showing the loading spinner"
		);
		assert.ok( failure instanceof Function, "Action has failure callback" );

		// let the action fail
		run( () => failure( failurePromiseData ).catch( data => {
			assert.strictEqual( data, failurePromiseData, "Rejects with correct data" );
			assert.step( "failure" );
		}) );

		assert.notOk(
			btn.querySelector( ".loading-spinner-component" ),
			"Is not showing the loading spinner anymore"
		);
		assert.ok(
			btn.querySelector( "i.fa" ).classList.contains( "anim-failure" ),
			"Icon has the animation failure class"
		);

		// let the animation end
		await triggerEvent( btn, "webkitAnimationEnd" );

		assert.notOk(
			btn.classList.contains( "animated" ),
			"Button does not have the animation class anymore"
		);
		assert.notOk(
			btn.querySelector( ".loading-spinner-component" ),
			"Is not showing the loading spinner after the success callback has resolved"
		);
		assert.notOk(
			btn.querySelector( "i.fa" ).classList.contains( "anim-failure" ),
			"Icon does not have the animation failure class anymore"
		);

		await assert.verifySteps(
			[ "failure" ],
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

		this.setProperties({
			action: actionResult,
			icon: "fa-times",
			iconanim: true,
			_iconAnimation() {}
		});
		await render( hbs`
			{{form-button
				action=action
				icon="fa-times"
				iconanim=true
				_iconAnimation=_iconAnimation
			}}
		` );
		const btn = this.element.querySelector( ".form-button-component" );

		actionResult.resolves( 123 );
		successPromise = new Promise( resolve => successResolve = resolve );
		successStub.resolves( successPromise );
		this.set( "_iconAnimation", successStub );
		await click( btn );
		// noinspection JSUnusedAssignment
		successResolve();
		await successPromise;
		assert.propEqual(
			successStub.args,
			[ [ STATE_SUCCESS, 123 ] ],
			"Calls icon success callback"
		);

		actionResult.rejects( 456 );
		failurePromise = new Promise( ( _, reject ) => failureReject = reject );
		failureStub.rejects( failurePromise );
		this.set( "_iconAnimation", failureStub );
		await click( btn );
		// noinspection JSUnusedAssignment
		failureReject();
		await assert.rejects( failurePromise );
		assert.propEqual(
			failureStub.args,
			[ [ STATE_FAILURE, 456 ] ],
			"Calls icon failure callback"
		);
	});

});
