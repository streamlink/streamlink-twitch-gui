import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
// TODO: use triggerKeyEvent of @ember/test-helpers once the event gets returned
import { buildResolver, triggerKeyDown } from "test-utils";
import { render, click, focus } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";

import RadioButtonsComponent from "ui/components/form/radio-buttons/component";
import RadioButtonsItemComponent from "ui/components/form/radio-buttons-item/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


module( "ui/components/form/radio-buttons", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			RadioButtonsComponent,
			RadioButtonsItemComponent,
			IsEqualHelper
		})
	});

	hooks.beforeEach(function() {
		this.getItems = () => Array.from(
			this.element.querySelectorAll( ".radio-buttons-item-component" )
		);
		this.getItem = n => this.getItems()[ n ];
		this.getLabels = () => this.getItems()
			.map( item => item.innerText.trim() );
		this.getChecked = () => this.getItems()
			.map( item => item.classList.contains( "checked" ) );
		this.getDisabled = () => this.getItems()
			.map( item => item.classList.contains( "disabled" ) );
	});


	test( "DOM nodes, selection and labels", async function( assert ) {
		const content = [{
			label: "foo",
			anotherLabel: "FOO"
		}, {
			label: "bar",
			anotherLabel: "BAR"
		}, {
			label: "baz",
			anotherLabel: "BAZ"
		}];

		this.setProperties({
			content,
			selection: content[1],
			optionLabelPath: "label"
		});

		await render( hbs`
			{{radio-buttons
				content=content
				selection=selection
				optionLabelPath=optionLabelPath
			}}
		` );
		const elem = this.element.querySelector( ".radio-buttons-component" );

		assert.ok( elem instanceof HTMLElement, "Component renders" );
		assert.propEqual(
			this.getLabels(),
			[ "foo", "bar", "baz" ],
			"Sets initial item labels"
		);
		assert.propEqual(
			this.getChecked(),
			[ false, true, false ],
			"Sets initial item selection"
		);
		assert.propEqual(
			this.getDisabled(),
			[ false, false, false ],
			"Sets initial disabled states"
		);

		// unset selection (unknown selection)
		this.set( "selection", null );
		assert.propEqual( this.getChecked(), [ false, false, false ], "No item is selected" );

		// set a matching selection
		this.set( "selection", content[2] );
		assert.propEqual( this.getChecked(), [ false, false, true ], "Updates item selection" );

		// click the first list item
		await click( this.getItem( 0 ) );
		assert.strictEqual( this.get( "selection" ), content[0], "Updates selection on change" );
		assert.propEqual( this.getChecked(), [ true, false, false ], "Updates item selections" );

		// disable the third item
		this.set( "content.2.disabled", true );
		assert.propEqual( this.getDisabled(), [ false, false, true ], "Disables third item" );

		// try to click the disabled item
		await click( this.getItem( 2 ) );
		assert.strictEqual( this.get( "selection" ), content[0], "Can't click disabled items" );
		assert.propEqual( this.getChecked(), [ true, false, false ], "Selection stays the same" );

		// change the optionLabelPath
		this.set( "optionLabelPath", "anotherLabel" );
		assert.propEqual(
			this.getLabels(),
			[ "FOO", "BAR", "BAZ" ],
			"optionLabelPath changes labels"
		);
	});


	test( "Custom component and child-component blocks", async function( assert ) {
		const content = [{
			id: 1,
			label: "foo",
			disabled: true
		}, {
			id: 2,
			label: "bar"
		}];

		this.setProperties({
			content,
			selection: content[1]
		});

		await render( hbs`
			{{#radio-buttons content=content selection=selection as |rb|}}
			  {{#rb.button}}
			    {{rb.label}}: {{rb.value}} ({{if rb.checked 'y' 'n'}} - {{if rb.disabled 'y' 'n'}})
			  {{/rb.button}}
			{{/radio-buttons}}
		` );

		assert.propEqual(
			this.getLabels(),
			[ "foo: 1 (n - y)", "bar: 2 (y - n)" ],
			"Custom labels"
		);
		assert.propEqual(
			this.getChecked(),
			[ false, true ],
			"Items have correct checked states"
		);
		assert.propEqual(
			this.getDisabled(),
			[ true, false ],
			"items have correct disabled states"
		);

	});


	test( "Hotkeys", async function( assert ) {
		let e;

		const content = [{
			id: 1,
			label: "foo"
		}, {
			id: 2,
			label: "bar"
		}];

		this.setProperties({
			content,
			selection: content[0]
		});
		await render( hbs`{{radio-buttons content=content selection=selection}}` );

		const elems = this.getItems();
		const elemTwo = elems[ 1 ];

		assert.propEqual(
			elems.map( elem => elem.getAttribute( "tabindex" ) ),
			[ "0", "0" ],
			"All items have a tabindex attribute with value 0"
		);

		e = triggerKeyDown( elemTwo, "Space" );
		assert.strictEqual( this.get( "selection" ), content[0], "Ignores Space if not focused" );
		assert.notOk( e.isDefaultPrevented(), "Doesn't prevent event's default action" );
		assert.notOk( e.isPropagationStopped(), "Doesn't stop event's propagation" );

		await focus( elemTwo );
		assert.strictEqual(
			this.element.ownerDocument.activeElement,
			elemTwo,
			"Second item is now focused"
		);

		e = triggerKeyDown( elemTwo, "Space" );
		assert.strictEqual( this.get( "selection" ), content[1], "Changes selection if focused" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );
		e = triggerKeyDown( elemTwo, "Space" );
		assert.strictEqual( this.get( "selection" ), content[1], "Keeps selection" );
		assert.ok( e.isDefaultPrevented(), "Prevents event's default action" );
		assert.ok( e.isPropagationStopped(), "Stops event's propagation" );

		triggerKeyDown( elemTwo, "Escape" );
		assert.notStrictEqual(
			document.activeElement,
			elemTwo,
			"Removes focus on Escape"
		);
	});

});
