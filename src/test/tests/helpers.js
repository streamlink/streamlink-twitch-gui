define([
	"Ember",
	"helpers/IsEqualHelper",
	"helpers/IsNullHelper",
	"helpers/IsGtHelper",
	"helpers/IsGteHelper",
	"helpers/BoolNotHelper",
	"helpers/BoolAndHelper",
	"helpers/BoolOrHelper",
	"helpers/MathAddHelper",
	"helpers/MathSubHelper",
	"helpers/MathMulHelper",
	"helpers/MathDivHelper",
	"helpers/FormatViewersHelper",
	"helpers/FormatTimeHelper",
	"helpers/HoursFromNowHelper",
	"helpers/TimeFromNowHelper",
	"helpers/GetParamHelper",
	"helpers/StringConcatHelper"
], function(
	Ember,
	IsEqualHelper,
	IsNullHelper,
	IsGtHelper,
	IsGteHelper,
	BoolNotHelper,
	BoolAndHelper,
	BoolOrHelper,
	MathAddHelper,
	MathSubHelper,
	MathMulHelper,
	MathDivHelper,
	FormatViewersHelper,
	FormatTimeHelper,
	HoursFromNowHelper,
	TimeFromNowHelper,
	GetParamHelper,
	StringConcatHelper
) {

	var get = Ember.get;
	var set = Ember.set;
	var run = Ember.run;
	var Component = Ember.Component;
	var compile = Ember.HTMLBars.compile;

	var registry, container, component;

	function runAppend( view ) {
		run( view, "appendTo", "#qunit-fixture" );
	}

	function runDestroy( destroyed ) {
		if ( destroyed ) {
			run( destroyed, "destroy" );
		}
	}

	function getOutput( component ) {
		return component.$().text();
	}

	QUnit.module( "Ember helpers", {
		"setup": function() {
			registry = new Ember.Registry();
			registry.optionsForType( "template", { instantiate: false } );
			registry.optionsForType( "helper", { singleton: false } );
			container = registry.container();
		},

		"teardown": function() {
			runDestroy( component );
			runDestroy( container );
			registry = container = component = null;
		}
	});


	QUnit.test( "Is equal", function( assert ) {

		registry.register( "helper:is-equal", IsEqualHelper );
		component = Component.extend({
			container: container,
			valA     : "foo",
			valB     : "foo",
			valC     : "foo",
			layout   : compile( "{{is-equal valA valB valC}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "Equal values" );
		run( component, "set", "valC", "bar" );
		assert.equal( getOutput( component ), "false", "Unequal values" );

	});


	QUnit.test( "Is null", function( assert ) {

		registry.register( "helper:is-null", IsNullHelper );
		component = Component.extend({
			container: container,
			valA     : null,
			valB     : null,
			valC     : null,
			layout   : compile( "{{is-null valA valB valC}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "All values are null" );
		run( component, "set", "valC", false );
		assert.equal( getOutput( component ), "false", "Some values are not null" );

	});


	QUnit.test( "Is greater than", function( assert ) {

		registry.register( "helper:is-gt", IsGtHelper );
		component = Component.extend({
			container: container,
			valA     : 2,
			valB     : 1,
			layout   : compile( "{{is-gt valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "2 is greater than 1" );
		run( component, "set", "valA", 0 );
		assert.equal( getOutput( component ), "false", "0 is not greater than 1" );

	});


	QUnit.test( "Is greater than or equal", function( assert ) {

		registry.register( "helper:is-gte", IsGteHelper );
		component = Component.extend({
			container: container,
			valA     : 2,
			valB     : 1,
			layout   : compile( "{{is-gte valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "2 is greater than or equal 1" );
		run( component, "set", "valA", 1 );
		assert.equal( getOutput( component ), "true", "1 is greater than or equal 1" );
		run( component, "set", "valA", 0 );
		assert.equal( getOutput( component ), "false", "0 is not greater than or equal 1" );

	});


	QUnit.test( "Bool not", function( assert ) {

		registry.register( "helper:bool-not", BoolNotHelper );
		component = Component.extend({
			container: container,
			valA     : false,
			valB     : null,
			valC     : undefined,
			valD     : "",
			layout   : compile( "{{bool-not valA valB valC valD}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "All values are falsey" );
		run( component, "set", "valA", true );
		assert.equal( getOutput( component ), "false", "Not all values are falsey" );

	});


	QUnit.test( "Bool and", function( assert ) {

		registry.register( "helper:bool-and", BoolAndHelper );
		component = Component.extend({
			container: container,
			valA     : true,
			valB     : true,
			layout   : compile( "{{bool-and valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "A and B" );
		run( component, "set", "valA", false );
		assert.equal( getOutput( component ), "false", "not A and B" );

	});


	QUnit.test( "Bool or", function( assert ) {

		registry.register( "helper:bool-or", BoolOrHelper );
		component = Component.extend({
			container: container,
			valA     : true,
			valB     : true,
			layout   : compile( "{{bool-or valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "true", "A or B" );
		run( component, "set", "valA", false );
		assert.equal( getOutput( component ), "true", "A or B" );
		run( component, "set", "valB", false );
		assert.equal( getOutput( component ), "false", "not A or B" );

	});


	QUnit.test( "Math add", function( assert ) {

		registry.register( "helper:math-add", MathAddHelper );
		component = Component.extend({
			container: container,
			valA     : 1,
			valB     : 2,
			layout   : compile( "{{math-add valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), 3, "1 + 2 = 3" );

	});


	QUnit.test( "Math sub", function( assert ) {

		registry.register( "helper:math-sub", MathSubHelper );
		component = Component.extend({
			container: container,
			valA     : 1,
			valB     : 2,
			layout   : compile( "{{math-sub valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), -1, "1 - 2 = -1" );

	});


	QUnit.test( "Math mul", function( assert ) {

		registry.register( "helper:math-mul", MathMulHelper );
		component = Component.extend({
			container: container,
			valA     : 7,
			valB     : 7,
			layout   : compile( "{{math-mul valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), 49, "7 * 7 = 49" );

	});


	QUnit.test( "Math div", function( assert ) {

		registry.register( "helper:math-div", MathDivHelper );
		component = Component.extend({
			container: container,
			valA     : 12,
			valB     : 3,
			layout   : compile( "{{math-div valA valB}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), 4, "12 / 3 = 4" );

	});


	QUnit.test( "Format viewers", function( assert ) {

		registry.register( "helper:format-viewers", FormatViewersHelper );
		component = Component.extend({
			container: container,
			viewers  : "",
			layout   : compile( "{{format-viewers viewers}}" )
		}).create();

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

		registry.register( "helper:format-time", FormatTimeHelper );
		component = Component.extend({
			container: container,
			time     : new Date(),
			format   : "D",
			layout   : compile( "{{format-time time format=format}}" )
		}).create();

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

		registry.register( "helper:hours-from-now", HoursFromNowHelper );
		component = Component.extend({
			container: container,
			layout   : compile( "{{hours-from-now dateA}} - {{hours-from-now dateB}}" )
		}).create();
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

		registry.register( "helper:hours-from-now", HoursFromNowHelper );
		component = Component.extend({
			container: container,
			layout   : compile( "{{hours-from-now date interval=40}}" )
		}).create();

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

		registry.register( "helper:time-from-now", TimeFromNowHelper );
		component = Component.extend({
			container: container,
			time     : new Date() - Math.PI * 60 * 1000,
			suffix   : false,
			layout   : compile( "{{time-from-now time suffix=suffix}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "3 minutes ago", "Time from now with suffix" );
		run( component, "set", "suffix", true );
		assert.equal( getOutput( component ), "3 minutes", "Time from now without suffix" );

	});


	QUnit.test( "Get param", function( assert ) {

		registry.register( "helper:get-param", GetParamHelper );
		component = Component.extend({
			container: container,
			param    : "baz",
			index    : 0,
			layout   : compile( "{{get-param 'foo' 'bar' param index=index}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "foo", "First parameter's value is foo" );
		run( component, "set", "index", 2 );
		assert.equal( getOutput( component ), "baz", "Bound parameter" );
		run( component, "set", "param", "qux" );
		assert.equal( getOutput( component ), "qux", "Changed bound parameter" );

	});


	QUnit.test( "String concat", function( assert ) {

		registry.register( "helper:string-concat", StringConcatHelper );
		component = Component.extend({
			container: container,
			foo      : "foo",
			bar      : "bar",
			layout   : compile( "{{string-concat foo bar 'baz'}}" )
		}).create();

		runAppend( component );
		assert.equal( getOutput( component ), "foobarbaz", "Simple string concatenation" );

		run( component, "set", "foo", undefined );
		run( component, "set", "bar", null );
		assert.equal( getOutput( component ), "baz", "Undefined values are empty strings" );

	});

});
