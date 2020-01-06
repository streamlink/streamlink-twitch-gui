import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService, FakeTHelper } from "i18n-utils";
import { triggerEvent } from "event-utils";
import { render, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import Component from "@ember/component";
import { set } from "@ember/object";
import { alias } from "@ember/object/computed";
import Evented from "@ember/object/evented";
import Service from "@ember/service";

// eslint-disable-next-line max-len
import followButtonComponentInjector from "inject-loader?ui/components/-mixins/twitch-interact-button!ui/components/button/-follow-button/component";
import FormButtonComponent from "ui/components/button/form-button/component";
import { helper as HotkeyTitleHelper } from "ui/components/helper/hotkey-title";
import { helper as FindByHelper } from "ui/components/helper/find-by";
import { helper as BoolNotHelper } from "ui/components/helper/bool-not";
import HotkeyService from "services/hotkey";


// TODO: properly rewrite tests (and component) and use sinon's useFakeTimer
module( "ui/components/button/-follow-button", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			FormButtonComponent,
			LoadingSpinnerComponent: Component.extend({
				classNames: [ "loading-spinner-component" ]
			}),
			I18nService: FakeI18nService,
			THelper: FakeTHelper,
			HotkeyService,
			HotkeyTitleHelper,
			SettingsService: Service.extend( Evented ),
			FindByHelper,
			BoolNotHelper
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "setTimeout", "clearTimeout" ],
			target: window
		});

		const { default: FollowButtonComponent } = followButtonComponentInjector({
			"ui/components/-mixins/twitch-interact-button": {}
		});

		const testContext = this;
		const expandSpy = sinon.spy();
		const collapseSpy = sinon.spy();
		this.expandSpy = expandSpy;
		this.collapseSpy = collapseSpy;
		this.followStub = sinon.stub().callsFake(function() {
			set( this, "isSuccessful", true );
		});
		this.unfollowStub = sinon.stub().callsFake(function() {
			set( this, "isSuccessful", false );
			this.collapse();
		});
		this.timeout = null;

		const Subject = FollowButtonComponent.extend({
			isLocked: alias( "isLoading" ),
			actions: {
				expand() {
					// sinon-stub with callsFake receives a wrong _super method here
					expandSpy.apply( this, arguments );
					return this._super( ...arguments );
				},
				collapse() {
					// sinon-stub with callsFake receives a wrong _super method here
					collapseSpy.apply( this, arguments );
					return this._super( ...arguments );
				},
				follow: this.followStub,
				unfollow: this.unfollowStub
			}
		});
		Object.defineProperty( Subject.prototype, "_timeout", {
			get() {
				return testContext.timeout;
			},
			set( value ) {
				testContext.timeout = value;
				return value;
			}
		});
		this.owner.register( "component:follow-button", Subject );
	});

	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Loading/success states and click actions", async function( assert ) {
		this.setProperties({
			name: "foo",
			isSuccessful: false,
			isLoading: true
		});
		await render( hbs`
			{{follow-button
				name=name
				isSuccessful=isSuccessful
				isLoading=isLoading
			}}
		` );

		const followButton = this.element.querySelector( ".follow-button-component" );
		const mainButton = followButton.querySelector(
			".form-button-component:not(.confirm-button)"
		);
		const confirmButton = followButton.querySelector(
			".form-button-component.confirm-button"
		);


		// loading

		assert.ok(
			   followButton
			&& mainButton
			&& confirmButton,
			"Renders the component correctly"
		);

		assert.ok(
			!followButton.classList.contains( "expanded" ),
			"Is not expanded initially"
		);

		assert.ok(
			followButton.querySelector( ".loading-spinner-component" ),
			"Shows the loading spinner while loading"
		);

		assert.ok(
			mainButton.classList.contains( "btn-info" ),
			"Main button has the btn-info class while loading"
		);

		assert.strictEqual(
			mainButton.title,
			"",
			"Main button doesn't have a title while loading"
		);

		await click( mainButton );
		await click( confirmButton );
		assert.ok(
			   this.expandSpy.notCalled
			&& this.collapseSpy.notCalled
			&& this.followStub.notCalled
			&& this.unfollowStub.notCalled,
			"No actions are being called when clicking any button while loading"
		);


		// loaded: not following

		this.set( "isLoading", false );

		assert.notOk(
			followButton.querySelector( ".loading-spinner-component" ),
			"Doesn't show the loading spinner anymore after finishing loading"
		);

		assert.ok(
			   mainButton.classList.contains( "btn-danger" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-heart-o" ),
			"When not following, the main button is red with an empty heart icon"
		);

		assert.strictEqual(
			mainButton.title,
			"[hotkeys.modifiers.ctrlKey+F] components.follow-button.follow{\"name\":\"foo\"}",
			"The main button has the correct title when not following"
		);

		await click( confirmButton );
		assert.ok(
			   this.expandSpy.notCalled
			&& this.collapseSpy.notCalled
			&& this.followStub.notCalled
			&& this.unfollowStub.notCalled,
			"The confirm button does not have an action while not being expanded"
		);

		await click( mainButton );
		assert.ok(
			this.followStub.called,
			"Follow action was called when clicking while not following"
		);
		this.followStub.resetHistory();


		// now following

		assert.ok(
			   mainButton.classList.contains( "btn-success" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-heart" ),
			"When following, the main button is green with a filled heart icon"
		);

		assert.strictEqual(
			mainButton.title,
			"[hotkeys.modifiers.ctrlKey+F] components.follow-button.unfollow{\"name\":\"foo\"}",
			"The main button has the correct title when following"
		);

		await click( confirmButton );
		assert.ok(
			   this.expandSpy.notCalled
			&& this.collapseSpy.notCalled
			&& this.followStub.notCalled
			&& this.unfollowStub.notCalled,
			"The confirm button does not have an action while not being expanded"
		);


		// expand

		await click( mainButton );

		assert.ok(
			this.expandSpy.called,
			"Expand action was called when clicking while following"
		);
		this.expandSpy.resetHistory();

		assert.ok(
			followButton.classList.contains( "expanded" ),
			"Component has the expanded class when clicking the main button while following"
		);

		assert.ok(
			   mainButton.classList.contains( "btn-success" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-arrow-left" ),
			"While being expanded, the main button is green and has the arrow left icon"
		);

		assert.strictEqual(
			mainButton.title,
			"[hotkeys.modifiers.ctrlKey+F] components.follow-button.keep{\"name\":\"foo\"}",
			"The main button has the correct title when being expanded"
		);

		assert.strictEqual(
			confirmButton.title,
			"[hotkeys.modifiers.ctrlKey+hotkeys.modifiers.shiftKey+F] "
				+ "components.follow-button.confirm{\"name\":\"foo\"}",
			"The confirm button has the correct title when being expanded"
		);

		assert.ok(
			   confirmButton.classList.contains( "btn-danger" )
			&& confirmButton.querySelector( "i" ).classList.contains( "fa-heart-o" ),
			"While being expanded, the confirm button is red and has an empty heart icon"
		);


		// unfollow

		await click( confirmButton );

		assert.ok(
			this.unfollowStub.called,
			"Unfollow action was called when clicking the confirm button in expanded state"
		);
		this.unfollowStub.resetHistory();

		assert.ok(
			!followButton.classList.contains( "expanded" ),
			"The confirm button fades out when clicking it"
		);

		assert.ok(
			   mainButton.classList.contains( "btn-success" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-arrow-left" ),
			"Main button is still green and has the arrow left icon until the transition completes"
		);

		await triggerEvent( confirmButton, "webkitTransitionEnd" );

		assert.ok(
			   mainButton.classList.contains( "btn-danger" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-heart-o" ),
			"When the transition completes, the main button is red with an empty heart icon again"
		);


		// collapse (from expanded state again)

		this.set( "isSuccessful", true );
		await click( mainButton );
		await click( mainButton );
		assert.ok(
			this.collapseSpy.called,
			"Collapse action was called when clicking the main button in expanded state"
		);
		this.collapseSpy.resetHistory();

		assert.ok(
			   mainButton.classList.contains( "btn-success" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-arrow-left" ),
			"Main button is still green and has the arrow left icon until the transition completes"
		);

		await triggerEvent( confirmButton, "webkitTransitionEnd" );

		assert.ok(
			   mainButton.classList.contains( "btn-success" )
			&& mainButton.querySelector( "i" ).classList.contains( "fa-heart" ),
			"When the transition completes, the main button is green with a filled heart icon again"
		);
	});


	test( "Mouseover and mouseout", async function( assert ) {
		this.setProperties({
			isSuccessful: true,
			isExpanded: false,
			isPromptVisible: false
		});
		await render( hbs`
			{{follow-button
				isSuccessful=isSuccessful
				isExpanded=isExpanded
				isPromptVisible=isPromptVisible
			}}
		` );

		const getState = () => ([ this.get( "isExpanded" ), this.get( "isPromptVisible" ) ]);

		const elem = this.element.querySelector( ".follow-button-component" );

		// initial state
		assert.propEqual(
			getState(),
			[ false, false ],
			"Prompt is hidden initially"
		);

		await triggerEvent( elem, "mouseout" );
		assert.notOk( this.timeout, "Does not have a timer when leaving and not expanded" );

		// expand
		await click( elem.querySelector( ".main-button" ) );
		assert.propEqual(
			getState(),
			[ true, true ],
			"Prompt is visible when expanded"
		);
		assert.notOk( this.timeout, "Does not have a timer" );

		// leave and re-enter before transition
		await triggerEvent( elem, "mouseout" );
		assert.propEqual(
			getState(),
			[ true, true ],
			"Prompt is still visible immediately after leaving"
		);
		assert.ok( this.timeout, "Does have a timer when leaving" );

		await triggerEvent( elem, "mouseover" );
		assert.propEqual(
			getState(),
			[ true, true ],
			"Prompt is still visible when re-entering before the transition"
		);
		assert.notOk( this.timeout, "Does not have a timer anymore" );

		// leave and re-enter during transition
		await triggerEvent( elem, "mouseout" );
		assert.ok( this.timeout, "Does have a timer before the transition" );

		this.fakeTimer.tick( 1001 );

		assert.propEqual(
			getState(),
			[ false, true ],
			"The prompt is fading out after the set time when leaving"
		);
		assert.notOk( this.timeout, "Does not have a timer during the transition" );

		await triggerEvent( elem, "mouseover" );
		assert.propEqual(
			getState(),
			[ true, true ],
			"Prompt is not fading anymore when re-entering during transition"
		);
		assert.notOk( this.timeout, "Does not have a timer after re-entering" );

		// leave
		await triggerEvent( elem, "mouseout" );

		this.fakeTimer.tick( 1001 );

		assert.propEqual(
			getState(),
			[ false, true ],
			"The prompt is fading out after the set time when leaving"
		);
		assert.notOk( this.timeout, "There is no timer during the transition" );

		await triggerEvent( elem.querySelector( ".confirm-button" ), "webkitTransitionEnd" );
		assert.propEqual(
			getState(),
			[ false, false ],
			"When the transition completes, the prompt is hidden"
		);
	});

});
