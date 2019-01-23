import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver, checkListeners } from "test-utils";
import { render, clearRender, click } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { A } from "@ember/array";

import DropDownListComponent from "ui/components/form/drop-down-list/component";
import { helper as IsEqualHelper } from "ui/components/helper/is-equal";


module( "ui/components/form/drop-down-list", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			IsEqualHelper
		})
	});

	hooks.beforeEach(function() {
		const testContext = this;
		const changeSpy = sinon.spy();
		this.changeSpy = changeSpy;
		this.clickListener = null;
		const Subject = DropDownListComponent.extend({
			actions: {
				change() {
					// sinon-stub with callsFake receives a wrong _super method here
					changeSpy.apply( this, arguments );
					return this._super( this, ...arguments );
				}
			}
		});
		Object.defineProperty( Subject.prototype, "_clickListener", {
			get() {
				return testContext.clickListener;
			},
			set( value ) {
				testContext.clickListener = value;
				return value;
			}
		});
		this.owner.register( "component:drop-down-list", Subject );
	});


	test( "Expand and collapse", async function( assert ) {
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
			selection: content[1],
			optionValuePath: "id",
			optionLabelPath: "label",
			expanded: false
		});

		await render( hbs`
			{{drop-down-list
				content=content
				selection=selection
				optionValuePath=optionValuePath
				optionLabelPath=optionLabelPath
				expanded=expanded
			}}
		` );

		let clickListener;
		const list = this.element.querySelector( ".drop-down-list-component" );
		const body = list.ownerDocument.body;

		// initial state
		assert.notOk( list.classList.contains( "expanded" ), "Is not expanded initially" );
		assert.notOk( this.clickListener, "Doesn't have a click listener" );

		// expand
		this.set( "expanded", true );
		clickListener = this.clickListener;
		assert.ok(
			list.classList.contains( "expanded" ),
			"List is expanded after clicking the selection"
		);
		assert.ok( clickListener, "Does have a click listener" );
		assert.ok(
			checkListeners( body, "click", clickListener ),
			"Has a click listener registered on the document body"
		);

		// collapse by clicking an item
		await click( list.querySelector( "li:nth-of-type(2)" ) );
		assert.strictEqual(
			this.changeSpy.args[ 0 ][ 0 ],
			content[ 1 ],
			"Passes second item as click action param"
		);
		assert.notOk(
			list.classList.contains( "expanded" ),
			"List collapsed after clicking an item"
		);
		assert.notOk( this.clickListener, "Doesn't have a click listener anymore" );
		assert.notOk(
			checkListeners( body, "click", clickListener ),
			"Old click listener is not registered on the document body anymore as well"
		);

		// collapse by clicking an external node
		this.set( "expanded", true );
		clickListener = this.clickListener;
		assert.ok( list.classList.contains( "expanded" ), "Is expanded now" );
		assert.ok( clickListener, "Does have a click listener" );
		assert.ok(
			checkListeners( body, "click", clickListener ),
			"Has a click listener registered on the document body"
		);

		await click( body );
		assert.notOk(
			list.classList.contains( "expanded" ),
			"List collapsed after clicking the document body"
		);
		assert.notOk( this.clickListener, "Doesn't have a click listener anymore" );
		assert.notOk(
			checkListeners( body, "click", clickListener ),
			"Old click listener is not registered on the document body anymore as well"
		);

		// component destruction
		this.set( "expanded", true );
		clickListener = this.clickListener;
		assert.ok( list.classList.contains( "expanded" ), "Is expanded now" );
		assert.ok( clickListener, "Does have a click listener" );
		assert.ok(
			checkListeners( body, "click", clickListener ),
			"Has a click listener registered on the document body"
		);
		await clearRender();
		assert.notOk( this.clickListener, "Removes click listener on destruction" );
		assert.notOk(
			checkListeners( body, "click", clickListener ),
			"Old click listener is not registered on the document body anymore as well"
		);
	});

});
