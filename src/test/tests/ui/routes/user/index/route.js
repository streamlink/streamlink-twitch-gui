import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import sinon from "sinon";

import Controller from "@ember/controller";
import Evented from "@ember/object/evented";
import Route from "@ember/routing/route";
import Service from "@ember/service";

import UserIndexRoute from "ui/routes/user/index/route";


module( "ui/routes/user/index/route", function( hooks ) {
	setupTest( hooks, {
		resolver: buildResolver({
			UserAuthRoute: Route.extend(),
			UserAuthController: Controller.extend()
		})
	});

	hooks.beforeEach(function() {
		this.abortSpy = sinon.spy();
		this.retrySpy = sinon.spy();
		this.intermediateTransitionToSpy = sinon.spy();
		this.transitionToSpy = sinon.spy();

		this.fakeTransition = {
			abort: this.abortSpy,
			retry: this.retrySpy
		};

		this.owner.register( "route:userIndex", UserIndexRoute.extend({
			// replace this, as we're not using a real router here
			intermediateTransitionTo: this.intermediateTransitionToSpy
		}) );

		this.owner.register( "service:auth", Service.extend( Evented, {
			session: {
				isLoggedIn: false,
				isPending: false
			}
		}) );
		this.owner.register( "service:router", Service.extend( Evented, {
			// replace this, as we're not using a real router here
			transitionTo: this.transitionToSpy
		}) );
	});


	test( "Already logged in", async function( assert ) {
		const AuthService = this.owner.lookup( "service:auth" );
		AuthService.session.isLoggedIn = true;

		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.notOk( this.abortSpy.called, "Doesn't abort transition if already logged in" );
	});

	test( "Auth record not loaded yet", async function( assert ) {
		const waitForLoginSpy = sinon.spy();

		const AuthService = this.owner.lookup( "service:auth" );
		AuthService.session = null;

		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		UserIndexRoute.reopen({
			_waitForLogin: waitForLoginSpy
		});
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.ok( this.abortSpy.calledOnce, "Aborts transition" );
		assert.notOk( waitForLoginSpy.called, "Doesn't call waitForLogin yet" );

		AuthService.trigger( "initialized" );
		assert.ok( waitForLoginSpy.calledOnce, "Calls waitForLogin after initialization" );

		AuthService.trigger( "initialized" );
		assert.ok( waitForLoginSpy.calledOnce, "Only waits once" );
	});

	test( "Not logged in - Redirect to login form", async function( assert ) {
		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.ok( this.abortSpy.calledOnce, "Aborts transition" );
		assert.strictEqual(
			this.owner.lookup( "controller:userAuth" ).previousTransition,
			this.fakeTransition,
			"Sets the previousTransition property on the UserAuthController"
		);
		assert.ok(
			this.transitionToSpy.calledWithExactly( "user.auth" ),
			"Transitions to the UserAuthRoute"
		);
	});

	test( "Pending login - Success", async function( assert ) {
		const AuthService = this.owner.lookup( "service:auth" );
		AuthService.session.isPending = true;

		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.ok( this.abortSpy.calledOnce, "Aborts transition" );
		assert.ok(
			this.intermediateTransitionToSpy.calledOnceWithExactly( "loading" ),
			"Shows loading route while logging in without updating the route"
		);
		assert.notOk( this.retrySpy.called, "Doesn't retry transition yet" );

		AuthService.trigger( "login", true );
		assert.ok( this.retrySpy.calledOnce, "Retries transition" );

		AuthService.trigger( "login", true );
		assert.ok( this.retrySpy.calledOnce, "Only retries once" );
	});

	test( "Pending login - Failure", async function( assert ) {
		const AuthService = this.owner.lookup( "service:auth" );
		AuthService.session.isPending = true;

		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.ok( this.abortSpy.calledOnce, "Aborts transition" );
		assert.ok(
			this.intermediateTransitionToSpy.calledOnceWithExactly( "loading" ),
			"Shows loading route while logging in without updating the route"
		);
		assert.notOk( this.transitionToSpy.called, "Hasn't transitioned to login form yet" );

		AuthService.trigger( "login", false );
		assert.notOk( this.retrySpy.called, "Doesn't retry transition" );
		assert.strictEqual(
			this.owner.lookup( "controller:userAuth" ).previousTransition,
			this.fakeTransition,
			"Sets the previousTransition property on the UserAuthController"
		);
		assert.ok(
			this.transitionToSpy.calledWithExactly( "user.auth" ),
			"Transitions to the UserAuthRoute"
		);
	});

	test( "Pending login - Abort", async function( assert ) {
		const AuthService = this.owner.lookup( "service:auth" );
		AuthService.session.isPending = true;

		const UserIndexRoute = this.owner.lookup( "route:userIndex" );
		await UserIndexRoute.beforeModel( this.fakeTransition );

		assert.ok( this.abortSpy.calledOnce, "Aborts transition" );
		assert.ok(
			this.intermediateTransitionToSpy.calledOnceWithExactly( "loading" ),
			"Shows loading route while logging in without updating the route"
		);

		const RouterService = this.owner.lookup( "service:router" );

		RouterService.trigger( "routeWillChange" );
		AuthService.trigger( "login", true );

		assert.notOk( this.retrySpy.called, "Doesn't retry transition if route was changed" );
	});
});
