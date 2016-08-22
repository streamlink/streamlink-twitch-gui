import QUnit from "QUnit";
import Testutils from "Testutils";
import Ember from "Ember";
import IsEqualHelper from "helpers/IsEqualHelper";
import IsNullHelper from "helpers/IsNullHelper";
import IsGtHelper from "helpers/IsGtHelper";
import IsGteHelper from "helpers/IsGteHelper";
import BoolNotHelper from "helpers/BoolNotHelper";
import BoolAndHelper from "helpers/BoolAndHelper";
import BoolOrHelper from "helpers/BoolOrHelper";
import MathAddHelper from "helpers/MathAddHelper";
import MathSubHelper from "helpers/MathSubHelper";
import MathMulHelper from "helpers/MathMulHelper";
import MathDivHelper from "helpers/MathDivHelper";
import FormatViewersHelper from "helpers/FormatViewersHelper";
import FormatTimeHelper from "helpers/FormatTimeHelper";
import HoursFromNowHelper from "helpers/HoursFromNowHelper";
import TimeFromNowHelper from "helpers/TimeFromNowHelper";
import GetParamHelper from "helpers/GetParamHelper";
import HasOwnPropertyHelper from "helpers/HasOwnPropertyHelper";


	var runAppend  = Testutils.runAppend;
	var runDestroy = Testutils.runDestroy;
	var getOutput  = Testutils.getOutput;
	var buildOwner = Testutils.buildOwner;

	var get = Ember.get;
	var set = Ember.set;
	var setOwner = Ember.setOwner;
	var run = Ember.run;
	var Component = Ember.Component;
	var compile = Ember.HTMLBars.compile;

	var owner, component;


	QUnit.module( "Ember helpers", {
		"setup": function() {
			owner = buildOwner();
		},

		"teardown": function() {
			runDestroy( component );
			runDestroy( owner );
			owner = component = null;
		}
	});


	QUnit.test( "Is equal", function( assert ) {

		owner.register( "helper:is-equal", IsEqualHelper );
		component = Component.extend({
			valA  : "foo",
			valB  : "foo",
			valC  : "foo",
			layout: compile( "{{is-equal valA valB valC}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "Equal values" );
		run( component, "set", "valC", "bar" );
		assert.equal( getOutput( component ), "false", "Unequal values" );

	});


	QUnit.test( "Is null", function( assert ) {

		owner.register( "helper:is-null", IsNullHelper );
		component = Component.extend({
			valA  : null,
			valB  : null,
			valC  : null,
			layout: compile( "{{is-null valA valB valC}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "All values are null" );
		run( component, "set", "valC", false );
		assert.equal( getOutput( component ), "false", "Some values are not null" );

	});


	QUnit.test( "Is greater than", function( assert ) {

		owner.register( "helper:is-gt", IsGtHelper );
		component = Component.extend({
			valA  : 2,
			valB  : 1,
			layout: compile( "{{is-gt valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "2 is greater than 1" );
		run( component, "set", "valA", 0 );
		assert.equal( getOutput( component ), "false", "0 is not greater than 1" );

	});


	QUnit.test( "Is greater than or equal", function( assert ) {

		owner.register( "helper:is-gte", IsGteHelper );
		component = Component.extend({
			valA  : 2,
			valB  : 1,
			layout: compile( "{{is-gte valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "2 is greater than or equal 1" );
		run( component, "set", "valA", 1 );
		assert.equal( getOutput( component ), "true", "1 is greater than or equal 1" );
		run( component, "set", "valA", 0 );
		assert.equal( getOutput( component ), "false", "0 is not greater than or equal 1" );

	});


	QUnit.test( "Bool not", function( assert ) {

		owner.register( "helper:bool-not", BoolNotHelper );
		component = Component.extend({
			valA  : false,
			valB  : null,
			valC  : undefined,
			valD  : "",
			layout: compile( "{{bool-not valA valB valC valD}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "All values are falsey" );
		run( component, "set", "valA", true );
		assert.equal( getOutput( component ), "false", "Not all values are falsey" );

	});


	QUnit.test( "Bool and", function( assert ) {

		owner.register( "helper:bool-and", BoolAndHelper );
		component = Component.extend({
			valA  : true,
			valB  : true,
			layout: compile( "{{bool-and valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "A and B" );
		run( component, "set", "valA", false );
		assert.equal( getOutput( component ), "false", "not A and B" );

	});


	QUnit.test( "Bool or", function( assert ) {

		owner.register( "helper:bool-or", BoolOrHelper );
		component = Component.extend({
			valA  : true,
			valB  : true,
			layout: compile( "{{bool-or valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "A or B" );
		run( component, "set", "valA", false );
		assert.equal( getOutput( component ), "true", "A or B" );
		run( component, "set", "valB", false );
		assert.equal( getOutput( component ), "false", "not A or B" );

	});


	QUnit.test( "Math add", function( assert ) {

		owner.register( "helper:math-add", MathAddHelper );
		component = Component.extend({
			valA  : 1,
			valB  : 2,
			layout: compile( "{{math-add valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), 3, "1 + 2 = 3" );

	});


	QUnit.test( "Math sub", function( assert ) {

		owner.register( "helper:math-sub", MathSubHelper );
		component = Component.extend({
			valA  : 1,
			valB  : 2,
			layout: compile( "{{math-sub valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), -1, "1 - 2 = -1" );

	});


	QUnit.test( "Math mul", function( assert ) {

		owner.register( "helper:math-mul", MathMulHelper );
		component = Component.extend({
			valA  : 7,
			valB  : 7,
			layout: compile( "{{math-mul valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), 49, "7 * 7 = 49" );

	});


	QUnit.test( "Math div", function( assert ) {

		owner.register( "helper:math-div", MathDivHelper );
		component = Component.extend({
			valA  : 12,
			valB  : 3,
			layout: compile( "{{math-div valA valB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), 4, "12 / 3 = 4" );

	});


	QUnit.test( "Format viewers", function( assert ) {

		owner.register( "helper:format-viewers", FormatViewersHelper );
		component = Component.extend({
			viewers: "",
			layout : compile( "{{format-viewers viewers}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "0", "Unexpected values" );
		run( component, "set", "viewers", "foo" );
		assert.equal( getOutput( component ), "0", "Unexpected values" );

		run( component, "set", "viewers", 9 );
		assert.equal( getOutput( component ), "9", "Less than 5 digits" );
		run( component, "set", "viewers", 99 );
		assert.equal( getOutput( component ), "99", "Less than 5 digits" );
		run( component, "set", "viewers", 999 );
		assert.equal( getOutput( component ), "999", "Less than 5 digits" );
		run( component, "set", "viewers", 9999 );
		assert.equal( getOutput( component ), "9999", "Less than 5 digits" );

		run( component, "set", "viewers", 10000 );
		assert.equal( getOutput( component ), "10.0k", "Thousands" );
		run( component, "set", "viewers", 10099 );
		assert.equal( getOutput( component ), "10.0k", "Thousands" );
		run( component, "set", "viewers", 10100 );
		assert.equal( getOutput( component ), "10.1k", "Thousands" );
		run( component, "set", "viewers", 99999 );
		assert.equal( getOutput( component ), "99.9k", "Thousands" );
		run( component, "set", "viewers", 100000 );
		assert.equal( getOutput( component ), "100k", "Thousands" );
		run( component, "set", "viewers", 999999 );
		assert.equal( getOutput( component ), "999k", "Thousands" );

		run( component, "set", "viewers", 1000000 );
		assert.equal( getOutput( component ), "1.00m", "Millions" );
		run( component, "set", "viewers", 1009999 );
		assert.equal( getOutput( component ), "1.00m", "Millions" );
		run( component, "set", "viewers", 1010000 );
		assert.equal( getOutput( component ), "1.01m", "Millions" );

	});


	QUnit.test( "Format time", function( assert ) {

		owner.register( "helper:format-time", FormatTimeHelper );
		component = Component.extend({
			time  : new Date(),
			format: "D",
			layout: compile( "{{format-time time format=format}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal(
			getOutput( component ),
			get( component, "time" ).getDate(),
			"Format time using a custom format"
		);

	});


	QUnit.test( "Hours from now", function( assert ) {

		var second = 1000;
		var minute = 60 * second;
		var hour   = 60 * minute;
		var day    = 24 * hour;

		owner.register( "helper:hours-from-now", HoursFromNowHelper );
		component = Component.extend({
			layout: compile( "{{hours-from-now dateA}} - {{hours-from-now dateB}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );


		run(function() {
			set( component, "dateA", +new Date() );
			set( component, "dateB", +new Date() - ( minute - second ) );
		});
		assert.equal( getOutput( component ), "just now - just now", "Less than a minute" );

		run(function() {
			set( component, "dateA", +new Date() - minute );
			set( component, "dateB", +new Date() - ( hour - second ) );
		});
		assert.equal( getOutput( component ), "01m - 59m", "Minutes" );

		run(function() {
			set( component, "dateA", +new Date() - hour );
			set( component, "dateB", +new Date() - ( day - second ) );
		});
		assert.equal( getOutput( component ), "1h - 23h59m", "Hours" );

		run(function() {
			set( component, "dateA", +new Date() - day );
			set( component, "dateB", +new Date() - ( 2 * day - second ) );
		});
		assert.equal( getOutput( component ), "1d - 1d23h", "Days" );

	});


	QUnit.test( "Hours from now with interval", function( assert ) {

		var done = assert.async();

		owner.register( "helper:hours-from-now", HoursFromNowHelper );
		component = Component.extend({
			layout: compile( "{{hours-from-now date interval=40}}" )
		}).create();
		setOwner( component, owner );

		set( component, "date", +new Date() - 59 * 1000 - 950 );
		runAppend( component );
		assert.equal( getOutput( component ), "just now", "Initial content" );

		run.later(function() {
			run.scheduleOnce( "afterRender", function() {
				assert.equal( getOutput( component ), "01m", "Upgraded content" );
				done();
			});
		}, 100 );

	});


	QUnit.test( "Time from now", function( assert ) {

		owner.register( "helper:time-from-now", TimeFromNowHelper );
		component = Component.extend({
			time  : new Date() - Math.PI * 60 * 1000,
			suffix: false,
			layout: compile( "{{time-from-now time suffix=suffix}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "3 minutes ago", "Time from now with suffix" );
		run( component, "set", "suffix", true );
		assert.equal( getOutput( component ), "3 minutes", "Time from now without suffix" );

	});


	QUnit.test( "Get param", function( assert ) {

		owner.register( "helper:get-param", GetParamHelper );
		component = Component.extend({
			param : "baz",
			index : 0,
			layout: compile( "{{get-param 'foo' 'bar' param index=index}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "foo", "First parameter's value is foo" );
		run( component, "set", "index", 2 );
		assert.equal( getOutput( component ), "baz", "Bound parameter" );
		run( component, "set", "param", "qux" );
		assert.equal( getOutput( component ), "qux", "Changed bound parameter" );

	});


	QUnit.test( "Has own property", function( assert ) {

		owner.register( "helper:has-own-property", HasOwnPropertyHelper );
		component = Component.extend({
			obj   : { foo: true },
			prop  : "foo",
			layout: compile( "{{has-own-property obj prop}}" )
		}).create();
		setOwner( component, owner );

		runAppend( component );
		assert.equal( getOutput( component ), "true", "Does have its own property" );
		run( component, "set", "prop", "bar" );
		assert.equal( getOutput( component ), "false", "Property does not exist" );
		run( component, "set", "prop", "toString" );
		assert.equal( getOutput( component ), "false", "Prototype property" );

	});
