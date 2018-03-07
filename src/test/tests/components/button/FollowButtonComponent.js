import { moduleForComponent, test } from "ember-qunit";
import { buildResolver } from "test-utils";
import { I18nService } from "i18n-utils";
import Component from "@ember/component";
import { get, set } from "@ember/object";
import { alias } from "@ember/object/computed";
import { run } from "@ember/runloop";
import Service from "@ember/service";
import sinon from "sinon";

import followButtonComponentInjector
	from "inject-loader?../mixins/twitch-interact-button!components/button/FollowButtonComponent";
import FormButtonComponent from "components/button/FormButtonComponent";
import HotkeyTitleHelper from "helpers/HotkeyTitleHelper";
import FindByHelper from "helpers/FindByHelper";
import BoolNotHelper from "helpers/BoolNotHelper";


const { default: FollowButtonComponent } = followButtonComponentInjector({
	"../mixins/twitch-interact-button": {}
});


moduleForComponent( "follow-button", "components/button/FollowButtonComponent", {
	unit: true,
	needs: [
		"component:form-button",
		"service:i18n",
		"helper:hotkey-title",
		"helper:find-by",
		"helper:bool-not"
	],
	resolver: buildResolver({
		FollowButtonComponent: FollowButtonComponent.extend({
			isLocked: alias( "isLoading" )
		}),
		FormButtonComponent,
		I18nService,
		HotkeyTitleHelper,
		FindByHelper,
		BoolNotHelper
	}),
	beforeEach() {
		const HotkeyService = Service.extend({
			register() {},
			unregister() {}
		});
		const LoadingSpinnerComponent = Component.extend({
			classNames: [ "loading-spinner-component" ]
		});

		this.register( "service:hotkey", HotkeyService );
		this.register( "component:loading-spinner", LoadingSpinnerComponent );
	}
});


test( "Loading/success states and click actions", function( assert ) {

	const subject = this.subject({
		name: "foo",
		isSuccessful: false,
		isLoading: true
	});

	const expand = sinon.spy( subject.actions, "expand" );
	const collapse = sinon.spy( subject.actions, "collapse" );
	const follow = sinon.stub( subject.actions, "follow" ).callsFake( () => {
		set( subject, "isSuccessful", true );
	});
	const unfollow = sinon.stub( subject.actions, "unfollow" ).callsFake( () => {
		set( subject, "isSuccessful", false );
		subject.collapse();
	});

	let $followButton = this.$();
	let $mainButton = $followButton.find( ".form-button-component:not(.confirm-button)" );
	let $confirmButton = $followButton.find( ".form-button-component.confirm-button" );


	// loading

	assert.ok(
		   $followButton.get( 0 ) instanceof HTMLDivElement
		&& $mainButton.get( 0 ) instanceof HTMLElement
		&& $confirmButton.get( 0 ) instanceof HTMLElement,
		"Renders the component correctly"
	);

	assert.ok(
		!$followButton.hasClass( "expanded" ),
		"Is not expanded initially"
	);

	assert.ok(
		$followButton.find( ".loading-spinner-component" ).get( 0 ) instanceof HTMLElement,
		"Shows the loading spinner while loading"
	);

	assert.ok(
		$mainButton.hasClass( "btn-info" ),
		"Main button has the btn-info class while loading"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"",
		"Main button doesn't have a title while loading"
	);

	$mainButton.click();
	$confirmButton.click();
	assert.notOk(
		expand.called || collapse.called || follow.called || unfollow.called,
		"No actions are being called when clicking any button while loading"
	);


	// loaded: not following

	run( () => set( subject, "isLoading", false ) );

	assert.strictEqual(
		$followButton.find( ".loading-spinner-component" ).length,
		0,
		"Doesn't show the loading spinner anymore after finishing loading"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-danger" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart-o" ),
		"When not following, the main button is red with an empty heart icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"[F] components.follow-button.follow{\"name\":\"foo\"}",
		"The main button has the correct title when not following"
	);

	$confirmButton.click();
	assert.notOk(
		expand.called || collapse.called || follow.called || unfollow.called,
		"The confirm button does not have an action while not being expanded"
	);

	run( () => $mainButton.click() );
	assert.ok(
		follow.called,
		"Follow action was called when clicking while not following"
	);
	follow.resetHistory();


	// now following

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart" ),
		"When following, the main button is green with a filled heart icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"[F] components.follow-button.unfollow{\"name\":\"foo\"}",
		"The main button has the correct title when following"
	);

	$confirmButton.click();
	assert.notOk(
		expand.called || collapse.called || follow.called || unfollow.called,
		"The confirm button does not have an action while not being expanded"
	);


	// expand

	run( () => $mainButton.click() );

	assert.ok(
		expand.called,
		"Expand action was called when clicking while following"
	);
	expand.reset();

	assert.ok(
		$followButton.hasClass( "expanded" ),
		"Component has the expanded class when clicking the main button while following"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"While being expanded, the main button is green and has the arrow left icon"
	);

	assert.strictEqual(
		$mainButton.prop( "title" ),
		"[F] components.follow-button.keep{\"name\":\"foo\"}",
		"The main button has the correct title when being expanded"
	);

	assert.strictEqual(
		$confirmButton.prop( "title" ),
		"[hotkeys.modifiers.ctrl+F] components.follow-button.confirm{\"name\":\"foo\"}",
		"The confirm button has the correct title when being expanded"
	);

	assert.ok(
		   $confirmButton.hasClass( "btn-danger" )
		&& $confirmButton.find( "i" ).hasClass( "fa-heart-o" ),
		"While being expanded, the confirm button is red and has an empty heart icon"
	);


	// unfollow

	run( () => $confirmButton.click() );

	assert.ok(
		unfollow.called,
		"Unfollow action was called when clicking the confirm button in expanded state"
	);
	unfollow.resetHistory();

	assert.ok(
		!$followButton.hasClass( "expanded" ),
		"The confirm button fades out when clicking it"
	);

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"The main button is still green and has the arrow left icon until the transition completes"
	);

	run( () => $confirmButton.trigger( "webkitTransitionEnd" ) );

	assert.ok(
		   $mainButton.hasClass( "btn-danger" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart-o" ),
		"When the transition completes, the main button is red with an empty heart icon again"
	);


	// collapse (from expanded state again)

	run( () => {
		set( subject, "isSuccessful", true );
		subject.expand();
	});

	$mainButton.click();
	assert.ok(
		collapse.called,
		"Collapse action was called when clicking the main button in expanded state"
	);
	collapse.reset();

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-arrow-left" ),
		"The main button is still green and has the arrow left icon until the transition completes"
	);

	run( () => $confirmButton.trigger( "webkitTransitionEnd" ) );

	assert.ok(
		   $mainButton.hasClass( "btn-success" )
		&& $mainButton.find( "i" ).hasClass( "fa-heart" ),
		"When the transition completes, the main button is green with a filled heart icon again"
	);

});


test( "Mouseenter and mouseleave", async function( assert ) {

	const mouseLeaveTime = 1;
	const subject = this.subject({
		isSuccessful: true,
		mouseLeaveTime
	});
	const $elem = this.$();

	// initial state
	assert.ok(
		   get( subject, "isExpanded" ) === false
		&& get( subject, "isPromptVisible" ) === false,
		"Prompt is hidden initially"
	);

	run( () => $elem.trigger( "mouseleave" ) );
	assert.strictEqual(
		subject._timeout,
		null,
		"Does not have a timer when leaving and not expanded"
	);

	// expand
	run( () => subject.expand() );
	assert.ok(
		   get( subject, "isExpanded" ) === true
		&& get( subject, "isPromptVisible" ) === true,
		"Prompt is visible when expanded"
	);
	assert.strictEqual(
		subject._timeout,
		null,
		"Does not have a timer"
	);

	// leave and re-enter before transition
	run( () => $elem.trigger( "mouseleave" ) );
	assert.ok(
		   get( subject, "isExpanded" ) === true
		&& get( subject, "isPromptVisible" ) === true,
		"Prompt is still visible immediately after leaving"
	);
	assert.notStrictEqual(
		subject._timeout,
		null,
		"Does have a timer when leaving"
	);

	run( () => $elem.trigger( "mouseenter" ) );
	assert.ok(
		   get( subject, "isExpanded" ) === true
		&& get( subject, "isPromptVisible" ) === true,
		"Prompt is still visible when re-entering before the transition"
	);
	assert.strictEqual(
		subject._timeout,
		null,
		"Does not have a timer anymore"
	);

	// leave and re-enter during transition
	run( () => $elem.trigger( "mouseleave" ) );
	assert.notStrictEqual(
		subject._timeout,
		null,
		"Does have a timer before the transition"
	);

	await new Promise( resolve => setTimeout( resolve, mouseLeaveTime + 1 ) );

	assert.ok(
		   get( subject, "isExpanded" ) === false
		&& get( subject, "isPromptVisible" ) === true,
		"The prompt is fading out after the set time when leaving"
	);
	assert.strictEqual(
		subject._timeout,
		null,
		"Does not have a timer during the transition"
	);

	run( () => $elem.trigger( "mouseenter" ) );
	assert.ok(
		   get( subject, "isExpanded" ) === true
		&& get( subject, "isPromptVisible" ) === true,
		"Prompt is not fading anymore when re-entering during transition"
	);
	assert.strictEqual(
		subject._timeout,
		null,
		"Does not have a timer after re-entering"
	);


	// leave
	run( () => $elem.trigger( "mouseleave" ) );

	await new Promise( resolve => setTimeout( resolve, mouseLeaveTime + 1 ) );

	assert.ok(
		   get( subject, "isExpanded" ) === false
		&& get( subject, "isPromptVisible" ) === true,
		"The prompt is fading out after the set time when leaving"
	);
	assert.strictEqual(
		subject._timeout,
		null,
		"There is no timer during the transition"
	);

	run( () => subject.$confirmbutton.trigger( "webkitTransitionEnd" ) );
	assert.ok(
		   get( subject, "isExpanded" ) === false
		&& get( subject, "isPromptVisible" ) === false,
		"When the transition completes, the prompt is hidden"
	);

});
