import { moduleForComponent, test } from "ember-qunit";
import { buildResolver, hbs, triggerKeyDown } from "test-utils";
import { I18nService } from "i18n-utils";
import { A as EmberNativeArray } from "@ember/array";
import { run } from "@ember/runloop";
import $ from "jquery";

import DropDownComponent from "ui/components/form/drop-down/component";
import DropDownSelectionComponent from "ui/components/form/drop-down-selection/component";
import DropDownListComponent from "ui/components/form/drop-down-list/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


moduleForComponent( "ui/components/form/drop-down", {
	integration: true,
	resolver: buildResolver({
		DropDownComponent,
		DropDownSelectionComponent,
		DropDownListComponent,
		IsEqualHelper,
		I18nService
	}),
	beforeEach() {
		this.getLabel = () => this.$( ".drop-down-selection-component" ).text().trim();
		this.getItems = () => this.$( ".drop-down-list-component" )
			.children();
		this.getLabels = () => this.getItems()
			.toArray()
			.map( item => $( item ).text().trim() );
		this.getSelections = () => this.getItems()
			.toArray()
			.map( item => $( item ).hasClass( "selected" ) );
	}
});


test( "DOM nodes, selection and labels", function( assert ) {

	const content = new EmberNativeArray([{
		label: "foo",
		anotherLabel: "FOO"
	}, {
		label: "bar",
		anotherLabel: "BAR"
	}, {
		label: "baz",
		anotherLabel: "BAZ"
	}]);

	this.setProperties({
		content,
		selection: content[1],
		optionLabelPath: "label"
	});
	this.render( hbs`
		{{drop-down content=content selection=selection optionLabelPath=optionLabelPath}}
	` );

	// component elements
	assert.ok(
		this.$( ".drop-down-component" ).get( 0 ) instanceof HTMLElement,
		"Renders the DropDownComponent"
	);
	assert.ok(
		this.$( ".drop-down-selection-component" ).get( 0 ) instanceof HTMLElement,
		"Renders the DropDownSelectionComponent"
	);
	assert.ok(
		this.$( ".drop-down-list-component" ).get( 0 ) instanceof HTMLElement,
		"Renders the DropDownListComponent"
	);

	// initial selection
	assert.strictEqual( this.getLabel(), "bar", "Sets initial selection label" );
	assert.propEqual( this.getLabels(), [ "foo", "bar", "baz" ], "Sets initial item labels" );
	assert.propEqual( this.getSelections(), [ false, true, false ], "Sets initial item selection" );

	// unset selection (unknown selection)
	this.set( "selection", null );
	assert.strictEqual(
		this.getLabel(),
		"components.drop-down-selection.placeholder",
		"Shows placeholder selection label"
	);
	assert.propEqual( this.getSelections(), [ false, false, false ], "No item is selected" );

	// set a matching selection
	this.set( "selection", content[2] );
	assert.strictEqual( this.getLabel(), "baz", "Shows correct selection label" );
	assert.deepEqual( this.getSelections(), [ false, false, true ], "Updates item selections" );

	// click the first list item
	run( () => this.getItems().eq( 0 ).click() );
	assert.strictEqual( this.get( "selection" ), content[0], "Updates selection on change" );
	assert.strictEqual( this.getLabel(), "foo", "Shows correct selection label" );
	assert.propEqual( this.getSelections(), [ true, false, false ], "Updates item selections" );

	// change the optionLabelPath
	this.set( "optionLabelPath", "anotherLabel" );
	assert.strictEqual( this.getLabel(), "FOO", "optionLabelPath changes selection label" );
	assert.propEqual( this.getLabels(), [ "FOO", "BAR", "BAZ" ], "Updates item labels as well" );

});


test( "Custom component and child-component blocks", function( assert ) {

	const content = [{
		id: 1,
		label: "foo"
	}, {
		id: 2,
		label: "bar"
	}];

	this.setProperties({
		content,
		selection: content[1]
	});
	this.render( hbs`
		{{#drop-down content=content selection=selection as |dropdown|}}
			{{#dropdown.selection placeholder="Choose!" as |selection|}}
				{{#if selection.hasSelection}}
					{{selection.label}}: {{selection.value}}
				{{else}}
					{{selection.placeholder}}
				{{/if}}
			{{/dropdown.selection}}
			{{#dropdown.list as |item|}}
				{{item.label}}: {{item.value}} ({{if item.isSelected 'y' 'n'}})
			{{/dropdown.list}}
		{{/drop-down}}
	` );

	// initial selection
	assert.strictEqual( this.getLabel(), "bar: 2", "Custom selection label" );
	assert.propEqual( this.getSelections(), [ false, true ], "Initial item selections" );
	assert.propEqual( this.getLabels(), [ "foo: 1 (n)", "bar: 2 (y)" ], "Custom item labels" );

	// click
	run( () => this.getItems().eq( 0 ).click() );
	assert.strictEqual( this.getLabel(), "foo: 1", "Updates selection label" );
	assert.propEqual( this.getSelections(), [ true, false ], "Updates item selections on click" );
	assert.propEqual( this.getLabels(), [ "foo: 1 (y)", "bar: 2 (n)" ], "Updates item labels" );

	// no selection
	this.set( "selection", null );
	assert.strictEqual( this.getLabel(), "Choose!", "Custom placeholder text" );
	assert.propEqual( this.getSelections(), [ false, false ], "Updates selections" );
	assert.propEqual( this.getLabels(), [ "foo: 1 (n)", "bar: 2 (n)" ], "Updates item labels" );

});


test( "Expand upwards", function( assert ) {

	const content = new EmberNativeArray([{
		id: 1,
		label: "foo"
	}, {
		id: 2,
		label: "bar"
	}, {
		id: 3,
		label: "baz"
	}]);

	this.setProperties({
		content,
		selection: content[0]
	});
	this.render( hbs`
		<style>
			main {
				position: relative;
				height: 1000px;
			}
			.drop-down-component,
			.drop-down-list-component > li {
				height: 100px;
			}
			/* Make sure component stylesheets don't interfere with the test */
			.drop-down-component,
			.drop-down-selection-component,
			.drop-down-list-component,
			.drop-down-list-component > li {
				margin: 0 !important;
				padding: 0 !important;
				border: 0 !important;
				max-height: unset !important;
			}
		</style>
		<main>
			<div class="spacing"></div>
			{{drop-down content=content selection=selection}}
		</main>
	` );

	const $spacing = this.$( "main > .spacing" );
	const $selection = this.$( ".drop-down-selection-component" );
	const $list = this.$( ".drop-down-list-component" );

	run( () => $selection.click() );
	assert.ok( $list.hasClass( "expanded" ), "Is expanded now" );
	assert.notOk( $list.hasClass( "expanded-upwards" ), "Is not expanded upwards" );
	run( () => $selection.click() );
	assert.notOk( $list.hasClass( "expanded" ), "Is not expanded anymore" );
	assert.notOk( $list.hasClass( "expanded-upwards" ), "Is also not expanded upwards" );

	$spacing.css({ height: 700 });
	run( () => $selection.click() );
	assert.ok( $list.hasClass( "expanded" ), "Is expanded now" );
	assert.notOk( $list.hasClass( "expanded-upwards" ), "Is not expanded upwards" );
	run( () => $selection.click() );
	assert.notOk( $list.hasClass( "expanded" ), "Is not expanded anymore" );
	assert.notOk( $list.hasClass( "expanded-upwards" ), "Is also not expanded upwards" );

	$spacing.css({ height: 701 });
	run( () => $selection.click() );
	assert.ok( $list.hasClass( "expanded" ), "Is expanded now" );
	assert.ok( $list.hasClass( "expanded-upwards" ), "Is expanded upwards" );
	run( () => $selection.click() );
	assert.notOk( $list.hasClass( "expanded" ), "Is not expanded anymore" );
	assert.ok( $list.hasClass( "expanded-upwards" ), "Is expanded upwards" );

});


test( "Hotkeys", function( assert ) {

	let e;

	const content = [{
		id: 1,
		label: "foo"
	}, {
		id: 2,
		label: "bar"
	}, {
		id: 3,
		label: "baz"
	}];

	this.setProperties({
		content,
		selection: content[0]
	});
	this.render( hbs`{{drop-down content=content selection=selection}}` );

	const $context = this.$();
	const $elem = $context.find( ".drop-down-component" );
	const $list = $context.find( ".drop-down-list-component" );

	assert.strictEqual( this.get( "selection" ), content[0], "Selection is first item initially" );
	assert.notOk( $list.hasClass( "expanded" ), "Is not expanded initially" );
	assert.strictEqual( $elem.attr( "tabindex" ), "0", "Has a tabindex attribute with value 0" );

	e = triggerKeyDown( $elem, "Space" );
	assert.notOk( $list.hasClass( "expanded" ), "Does not react to spacebar when not focused" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
	e = triggerKeyDown( $elem, "ArrowDown" );
	assert.strictEqual( this.get( "selection" ), content[0], "Doesn't change on ArrowDown" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
	e = triggerKeyDown( $elem, "ArrowUp" );
	assert.strictEqual( this.get( "selection" ), content[0], "Doesn't change on ArrowUp" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

	$elem.focus();

	e = triggerKeyDown( $elem, "ArrowDown" );
	assert.strictEqual( this.get( "selection" ), content[0], "Needs expanded list on ArrowDown" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
	e = triggerKeyDown( $elem, "ArrowUp" );
	assert.strictEqual( this.get( "selection" ), content[0], "Needs expanded list on ArrowUp" );
	assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
	assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

	e = triggerKeyDown( $elem, "Space" );
	assert.ok( $list.hasClass( "expanded" ), "Toggles expansion when focused on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
	e = triggerKeyDown( $elem, "Space" );
	assert.notOk( $list.hasClass( "expanded" ), "Toggles expansion when focused on Space" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

	triggerKeyDown( $elem, "Space" );

	e = triggerKeyDown( $elem, "ArrowDown" );
	assert.strictEqual( this.get( "selection" ), content[1], "Selects next item on ArrowDown" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
	triggerKeyDown( $elem, "ArrowDown" );
	assert.strictEqual( this.get( "selection" ), content[2], "Selects next item again" );
	triggerKeyDown( $elem, "ArrowDown" );
	assert.strictEqual( this.get( "selection" ), content[0], "Jumps to first item on list end" );

	e = triggerKeyDown( $elem, "ArrowUp" );
	assert.strictEqual( this.get( "selection" ), content[2], "Jumps to last item on ArrowUp" );
	assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
	assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
	triggerKeyDown( $elem, "ArrowUp" );
	assert.strictEqual( this.get( "selection" ), content[1], "Selects previous item on ArrowUp" );
	triggerKeyDown( $elem, "ArrowUp" );
	assert.strictEqual( this.get( "selection" ), content[0], "Selects previous item again" );

	triggerKeyDown( $elem, "Escape" );
	assert.notOk( $list.hasClass( "expanded" ), "Collapses list on Escape" );
	assert.strictEqual( document.activeElement, $elem[0], "Doesn't remove focus on Escape" );
	triggerKeyDown( $elem, "Escape" );
	assert.notStrictEqual( document.activeElement, $elem[0], "Removes focus on second Escape" );

});
