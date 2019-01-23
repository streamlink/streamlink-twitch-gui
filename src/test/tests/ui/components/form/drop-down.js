import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import { triggerKeyDownEvent } from "event-utils";
import { render, click, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import { A } from "@ember/array";

import DropDownComponent from "ui/components/form/drop-down/component";
import DropDownSelectionComponent from "ui/components/form/drop-down-selection/component";
import DropDownListComponent from "ui/components/form/drop-down-list/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


module( "ui/components/form/drop-down", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			DropDownComponent,
			DropDownSelectionComponent,
			DropDownListComponent,
			IsEqualHelper,
			I18nService: FakeI18nService
		})
	});

	hooks.beforeEach(function() {
		this.getLabel = () => this.element.querySelector( ".drop-down-selection-component" )
			.innerText.trim();
		this.getItems = () => Array.from(
			this.element.querySelectorAll( ".drop-down-list-component > *" )
		);
		this.getItem = n => this.getItems()[ n ];
		this.getLabels = () => this.getItems()
			.map( item => item.innerText.trim() );
		this.getSelections = () => this.getItems()
			.map( item => item.classList.contains( "selected" ) );
	});


	test( "DOM nodes, selection and labels", async function( assert ) {
		const content = A([{
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
		await render( hbs`
			{{drop-down content=content selection=selection optionLabelPath=optionLabelPath}}
		` );

		// component elements
		assert.ok(
			this.element.querySelector( ".drop-down-component" ) instanceof HTMLElement,
			"Renders the DropDownComponent"
		);
		assert.ok(
			this.element.querySelector( ".drop-down-selection-component" ) instanceof HTMLElement,
			"Renders the DropDownSelectionComponent"
		);
		assert.ok(
			this.element.querySelector( ".drop-down-list-component" ) instanceof HTMLElement,
			"Renders the DropDownListComponent"
		);

		// initial selection
		assert.strictEqual( this.getLabel(), "bar", "Sets initial selection label" );
		assert.propEqual( this.getLabels(), [ "foo", "bar", "baz" ], "Sets initial item labels" );
		assert.propEqual(
			this.getSelections(),
			[ false, true, false ],
			"Sets initial item selection"
		);

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
		await click( this.getItem( 0 ) );
		assert.strictEqual( this.get( "selection" ), content[0], "Updates selection on change" );
		assert.strictEqual( this.getLabel(), "foo", "Shows correct selection label" );
		assert.propEqual( this.getSelections(), [ true, false, false ], "Updates item selections" );

		// change the optionLabelPath
		this.set( "optionLabelPath", "anotherLabel" );
		assert.strictEqual( this.getLabel(), "FOO", "optionLabelPath changes selection label" );
		assert.propEqual(
			this.getLabels(),
			[ "FOO", "BAR", "BAZ" ],
			"Updates item labels as well"
		);
	});


	test( "Custom component and child-component blocks", async function( assert ) {
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
		await render( hbs`
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
		await click( this.getItem( 0 ) );
		assert.strictEqual( this.getLabel(), "foo: 1", "Updates selection label" );
		assert.propEqual( this.getSelections(), [ true, false ], "Updates selections" );
		assert.propEqual( this.getLabels(), [ "foo: 1 (y)", "bar: 2 (n)" ], "Updates item labels" );

		// no selection
		this.set( "selection", null );
		assert.strictEqual( this.getLabel(), "Choose!", "Custom placeholder text" );
		assert.propEqual( this.getSelections(), [ false, false ], "Updates selections" );
		assert.propEqual( this.getLabels(), [ "foo: 1 (n)", "bar: 2 (n)" ], "Updates item labels" );
	});


	test( "Expand upwards", async function( assert ) {
		const content = A([{
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
		// noinspection CssUnusedSymbol
		await render( hbs`
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

		const spacing = this.element.querySelector( "main > .spacing" );
		const selection = this.element.querySelector( ".drop-down-selection-component" );
		const list = this.element.querySelector( ".drop-down-list-component" );

		await click( selection );
		assert.ok( list.classList.contains( "expanded" ), "Is expanded now" );
		assert.notOk( list.classList.contains( "expanded-upwards" ), "Is expanded downwards" );
		await click( selection );
		assert.notOk( list.classList.contains( "expanded" ), "Is not expanded anymore" );
		assert.notOk( list.classList.contains( "expanded-upwards" ), "Is also expanded downwards" );

		spacing.style.height = "700px";
		await click( selection );
		assert.ok( list.classList.contains( "expanded" ), "Is expanded now" );
		assert.notOk( list.classList.contains( "expanded-upwards" ), "Is expanded downwards" );
		await click( selection );
		assert.notOk( list.classList.contains( "expanded" ), "Is not expanded anymore" );
		assert.notOk( list.classList.contains( "expanded-upwards" ), "Is also expanded downwards" );

		spacing.style.height = "701px";
		await click( selection );
		assert.ok( list.classList.contains( "expanded" ), "Is expanded now" );
		assert.ok( list.classList.contains( "expanded-upwards" ), "Is expanded upwards" );
		await click( selection );
		assert.notOk( list.classList.contains( "expanded" ), "Is not expanded anymore" );
		assert.ok( list.classList.contains( "expanded-upwards" ), "Is expanded upwards" );
	});


	test( "Hotkeys", async function( assert ) {
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
		await render( hbs`{{drop-down content=content selection=selection}}` );

		const context = this.element;
		const elem = context.querySelector( ".drop-down-component" );
		const list = context.querySelector( ".drop-down-list-component" );

		assert.strictEqual( this.get( "selection" ), content[0], "Initial selection is foo" );
		assert.notOk( list.classList.contains( "expanded" ), "Is not expanded initially" );
		assert.strictEqual( elem.getAttribute( "tabindex" ), "0", "Tabindex attribute is 0" );

		e = await triggerKeyDownEvent( elem, "Space" );
		assert.notOk(
			list.classList.contains( "expanded" ),
			"Does not react to spacebar when not focused"
		);
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
		e = await triggerKeyDownEvent( elem, "ArrowDown" );
		assert.strictEqual( this.get( "selection" ), content[0], "Doesn't change on ArrowDown" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
		e = await triggerKeyDownEvent( elem, "ArrowUp" );
		assert.strictEqual( this.get( "selection" ), content[0], "Doesn't change on ArrowUp" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

		await focus( elem );

		e = await triggerKeyDownEvent( elem, "ArrowDown" );
		assert.strictEqual( this.get( "selection" ), content[0], "No new selection on ArrowDown" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );
		e = await triggerKeyDownEvent( elem, "ArrowUp" );
		assert.strictEqual( this.get( "selection" ), content[0], "No new selection on ArrowUp" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

		e = await triggerKeyDownEvent( elem, "Space" );
		assert.ok(
			list.classList.contains( "expanded" ),
			"Toggles expansion when focused on Space"
		);
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
		e = await triggerKeyDownEvent( elem, "Space" );
		assert.notOk(
			list.classList.contains( "expanded" ),
			"Toggles expansion when focused on Space"
		);
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

		await triggerKeyDownEvent( elem, "Space" );

		e = await triggerKeyDownEvent( elem, "ArrowDown" );
		assert.strictEqual( this.get( "selection" ), content[1], "Selects next item on ArrowDown" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
		await triggerKeyDownEvent( elem, "ArrowDown" );
		assert.strictEqual( this.get( "selection" ), content[2], "Selects next item again" );
		await triggerKeyDownEvent( elem, "ArrowDown" );
		assert.strictEqual( this.get( "selection" ), content[0], "Jumps to first item at the end" );

		e = await triggerKeyDownEvent( elem, "ArrowUp" );
		assert.strictEqual( this.get( "selection" ), content[2], "Jumps to last item on ArrowUp" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
		await triggerKeyDownEvent( elem, "ArrowUp" );
		assert.strictEqual( this.get( "selection" ), content[1], "Selects prev item on ArrowUp" );
		await triggerKeyDownEvent( elem, "ArrowUp" );
		assert.strictEqual( this.get( "selection" ), content[0], "Selects previous item again" );

		await triggerKeyDownEvent( elem, "Escape" );
		assert.notOk( list.classList.contains( "expanded" ), "Collapses list on Escape" );
		assert.strictEqual( document.activeElement, elem, "Doesn't remove focus on Escape" );
		await triggerKeyDownEvent( elem, "Escape" );
		assert.notStrictEqual( document.activeElement, elem, "Removes focus on second Escape" );
	});

});
