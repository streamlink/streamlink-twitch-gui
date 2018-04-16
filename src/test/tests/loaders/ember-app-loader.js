import { module, test } from "qunit";

import parse from "root/web_loaders/ember-app-loader/parse";
import build from "root/web_loaders/ember-app-loader/build";


module( "loaders/ember-app-loader", {
	beforeEach() {
		this.subject = async files => {
			const getModuleExports = module => Promise.resolve( files[ module ] );
			const promises = parse( Object.keys( files ), getModuleExports );
			return await Promise.all( promises );
		};
	}
});


test( "Private collections", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/models/-foo/bar.js": [],
			"data/models/-foo/bar/baz.js": [],
			"data/models/-foo.js": []
		}),
		[
			false,
			false,
			false
		],
		"Returns false for private collections and modules"
	);

});


test( "Groups and collections", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/foo.js": [],
			"ui/bar.js": []
		}),
		[
			false,
			false
		],
		"Returns false for root modules in a group"
	);

	assert.propEqual(
		await this.subject({
			"data/foo/bar.js": [],
			"ui/foo/bar.js": []
		}),
		[
			false,
			false
		],
		"Returns false for modules in invalid group-collections"
	);

	assert.propEqual(
		await this.subject({
			"foo/bar.js": []
		}),
		[
			false
		],
		"Returns false for modules in invalid collections"
	);

});


test( "Explicit types", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"ui/components/foo/component.js": [ "default" ],
			"ui/components/foo/helper.js": [ "default" ],
			"ui/components/foo/adapter.js": [ "default" ],
			"ui/components/foo/fragment.js": [ "default" ],
			"ui/components/foo/model.js": [ "default" ],
			"ui/components/foo/serializer.js": [ "default" ],
			"ui/components/foo/controller.js": [ "default" ],
			"ui/components/foo/route.js": [ "default" ],
			"ui/components/foo/template.hbs": [],
			"ui/components/foo/service.js": [ "default" ],
			"ui/components/foo/transform.js": [ "default" ]
		}),
		[
			{
				name: "FooComponent",
				path: "ui/components/foo/component.js",
				exportName: "default"
			},
			{
				name: "FooHelper",
				path: "ui/components/foo/helper.js",
				exportName: "default"
			},
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		],
		"Explicit types in the components collection"
	);

	assert.propEqual(
		await this.subject({
			"data/models/foo/component.js": [ "default" ],
			"data/models/foo/helper.js": [ "default" ],
			"data/models/foo/adapter.js": [ "default" ],
			"data/models/foo/fragment.js": [ "default" ],
			"data/models/foo/model.js": [ "default" ],
			"data/models/foo/serializer.js": [ "default" ],
			"data/models/foo/controller.js": [ "default" ],
			"data/models/foo/route.js": [ "default" ],
			"data/models/foo/template.hbs": [],
			"data/models/foo/service.js": [ "default" ],
			"data/models/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			{
				name: "FooAdapter",
				path: "data/models/foo/adapter.js",
				exportName: "default"
			},
			{
				name: "Foo",
				path: "data/models/foo/fragment.js",
				exportName: "default"
			},
			{
				name: "Foo",
				path: "data/models/foo/model.js",
				exportName: "default"
			},
			{
				name: "FooSerializer",
				path: "data/models/foo/serializer.js",
				exportName: "default"
			},
			false,
			false,
			false,
			false,
			false
		],
		"Explicit types in the models collection"
	);

	assert.propEqual(
		await this.subject({
			"ui/routes/foo/component.js": [ "default" ],
			"ui/routes/foo/helper.js": [ "default" ],
			"ui/routes/foo/adapter.js": [ "default" ],
			"ui/routes/foo/fragment.js": [ "default" ],
			"ui/routes/foo/model.js": [ "default" ],
			"ui/routes/foo/serializer.js": [ "default" ],
			"ui/routes/foo/controller.js": [ "default" ],
			"ui/routes/foo/route.js": [ "default" ],
			"ui/routes/foo/template.hbs": [],
			"ui/routes/foo/service.js": [ "default" ],
			"ui/routes/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			false,
			false,
			false,
			false,
			{
				name: "FooController",
				path: "ui/routes/foo/controller.js",
				exportName: "default"
			},
			{
				name: "FooRoute",
				path: "ui/routes/foo/route.js",
				exportName: "default"
			},
			{
				name: "FooTemplate",
				path: "ui/routes/foo/template.hbs",
				exportName: null
			},
			false,
			false
		],
		"Explicit types in the routes collection"
	);

	assert.propEqual(
		await this.subject({
			"services/foo/component.js": [ "default" ],
			"services/foo/helper.js": [ "default" ],
			"services/foo/adapter.js": [ "default" ],
			"services/foo/fragment.js": [ "default" ],
			"services/foo/model.js": [ "default" ],
			"services/foo/serializer.js": [ "default" ],
			"services/foo/controller.js": [ "default" ],
			"services/foo/route.js": [ "default" ],
			"services/foo/template.hbs": [],
			"services/foo/service.js": [ "default" ],
			"services/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			{
				name: "FooService",
				path: "services/foo/service.js",
				exportName: "default"
			},
			false
		],
		"Explicit types in the services collection"
	);

	assert.propEqual(
		await this.subject({
			"data/transforms/foo/component.js": [ "default" ],
			"data/transforms/foo/helper.js": [ "default" ],
			"data/transforms/foo/adapter.js": [ "default" ],
			"data/transforms/foo/fragment.js": [ "default" ],
			"data/transforms/foo/model.js": [ "default" ],
			"data/transforms/foo/serializer.js": [ "default" ],
			"data/transforms/foo/controller.js": [ "default" ],
			"data/transforms/foo/route.js": [ "default" ],
			"data/transforms/foo/template.hbs": [],
			"data/transforms/foo/service.js": [ "default" ],
			"data/transforms/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			{
				name: "FooTransform",
				path: "data/transforms/foo/transform.js",
				exportName: "default"
			}
		],
		"Explicit types in the transforms collection"
	);

});


test( "Invalid export of explicit types", async function( assert ) {

	await assert.rejects(
		this.subject({
			"data/models/foo/model.js": [ "foo" ]
		}),
		new Error( "Invalid export of module: data/models/foo/model.js" ),
		"Rejects on missing default export"
	);

	await assert.rejects(
		this.subject({
			"ui/routes/foo/template.hbs": [ "default" ]
		}),
		new Error( "Invalid export of module: ui/routes/foo/template.hbs" ),
		"Rejects on invalid export"
	);

});


test( "Default collection types", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/models/foo.js": [ "default" ],
			"data/transforms/foo.js": [ "default" ],
			"ui/components/foo.js": [ "default" ],
			"ui/routes/foo.js": [ "default" ],
			"services/foo.js": [ "default" ]
		}),
		[
			{
				name: "Foo",
				path: "data/models/foo.js",
				exportName: "default"
			},
			{
				name: "FooTransform",
				path: "data/transforms/foo.js",
				exportName: "default"
			},
			{
				name: "FooComponent",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "FooRoute",
				path: "ui/routes/foo.js",
				exportName: "default"
			},
			{
				name: "FooService",
				path: "services/foo.js",
				exportName: "default"
			}
		],
		"Default module types"
	);

	await assert.rejects(
		this.subject({
			"data/models/foo.js": [ "foo" ]
		}),
		new Error( "Invalid export of module: data/models/foo.js" ),
		"Rejects on invalid export of expected default types"
	);

});


test( "Implicit types", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/models/foo.js": [ "adapter" ],
			"data/models/bar.js": [ "fragment" ],
			"data/models/baz.js": [ "model" ],
			"data/models/qux.js": [ "serializer" ],
			"data/transforms/foo.js": [ "transform" ],
			"ui/components/foo.js": [ "component" ],
			"ui/components/bar.js": [ "helper" ],
			"ui/routes/foo.js": [ "controller" ],
			"ui/routes/bar.js": [ "route" ],
			"ui/routes/baz.hbs": [ "template" ],
			"services/foo.js": [ "service" ]
		}),
		[
			{
				name: "FooAdapter",
				path: "data/models/foo.js",
				exportName: "adapter"
			},
			{
				name: "Bar",
				path: "data/models/bar.js",
				exportName: "fragment"
			},
			{
				name: "Baz",
				path: "data/models/baz.js",
				exportName: "model"
			},
			{
				name: "QuxSerializer",
				path: "data/models/qux.js",
				exportName: "serializer"
			},
			{
				name: "FooTransform",
				path: "data/transforms/foo.js",
				exportName: "transform"
			},
			{
				name: "FooComponent",
				path: "ui/components/foo.js",
				exportName: "component"
			},
			{
				name: "BarHelper",
				path: "ui/components/bar.js",
				exportName: "helper"
			},
			{
				name: "FooController",
				path: "ui/routes/foo.js",
				exportName: "controller"
			},
			{
				name: "BarRoute",
				path: "ui/routes/bar.js",
				exportName: "route"
			},
			{
				name: "BazTemplate",
				path: "ui/routes/baz.hbs",
				exportName: "template"
			},
			{
				name: "FooService",
				path: "services/foo.js",
				exportName: "service"
			}
		],
		"Implicit types"
	);

	await assert.rejects(
		this.subject({
			"ui/components/foo.js": [ "route" ]
		}),
		new Error( "Invalid export of module: ui/components/foo.js" ),
		"Rejects on invalid export of implicit types"
	);

});


test( "Module name nesting", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/models/foo/bar/baz/adapter.js": [ "default" ],
			"data/models/foo/bar/baz/fragment.js": [ "default" ],
			"data/models/foo/bar/baz/model.js": [ "default" ],
			"data/models/foo/bar/baz/serializer.js": [ "default" ],
			"data/transforms/foo/bar/baz/transform.js": [ "default" ],
			"ui/components/foo/bar/baz/component.js": [ "default" ],
			"ui/components/foo/bar/baz/helper.js": [ "default" ],
			"ui/routes/foo/bar/baz/controller.js": [ "default" ],
			"ui/routes/foo/bar/baz/route.js": [ "default" ],
			"ui/routes/foo/bar/baz/template.hbs": [],
			"services/foo/bar/baz/service.js": [ "default" ]
		}),
		[
			{
				name: "FooBarBazAdapter",
				path: "data/models/foo/bar/baz/adapter.js",
				exportName: "default"
			},
			{
				name: "FooBarBaz",
				path: "data/models/foo/bar/baz/fragment.js",
				exportName: "default"
			},
			{
				name: "FooBarBaz",
				path: "data/models/foo/bar/baz/model.js",
				exportName: "default"
			},
			{
				name: "FooBarBazSerializer",
				path: "data/models/foo/bar/baz/serializer.js",
				exportName: "default"
			},
			{
				name: "FooBarBazTransform",
				path: "data/transforms/foo/bar/baz/transform.js",
				exportName: "default"
			},
			{
				name: "BazComponent",
				path: "ui/components/foo/bar/baz/component.js",
				exportName: "default"
			},
			{
				name: "BazHelper",
				path: "ui/components/foo/bar/baz/helper.js",
				exportName: "default"
			},
			{
				name: "FooBarBazController",
				path: "ui/routes/foo/bar/baz/controller.js",
				exportName: "default"
			},
			{
				name: "FooBarBazRoute",
				path: "ui/routes/foo/bar/baz/route.js",
				exportName: "default"
			},
			{
				name: "FooBarBazTemplate",
				path: "ui/routes/foo/bar/baz/template.hbs",
				exportName: null
			},
			{
				name: "FooBarBazService",
				path: "services/foo/bar/baz/service.js",
				exportName: "default"
			}
		],
		"Nests all modules names except those in the components collection"
	);

	assert.propEqual(
		await this.subject({
			"ui/components/foo-bar/component.js": [ "default" ],
			"ui/components/foo-bar/baz.js": [ "component" ],
			"ui/routes/foo-bar/route.js": [ "default" ],
			"ui/routes/foo-bar/baz.js": [ "route" ]
		}),
		[
			{
				name: "FooBarComponent",
				path: "ui/components/foo-bar/component.js",
				exportName: "default"
			},
			{
				name: "BazComponent",
				path: "ui/components/foo-bar/baz.js",
				exportName: "component"
			},
			{
				name: "FooBarRoute",
				path: "ui/routes/foo-bar/route.js",
				exportName: "default"
			},
			{
				name: "FooBarBazRoute",
				path: "ui/routes/foo-bar/baz.js",
				exportName: "route"
			}
		],
		"Applies camel case to segments with dashes and respects collection nesting configuration"
	);

});


test( "Duplicates", function( assert ) {

	assert.throws(
		() => build([
			{
				name: "FooComponent",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "FooComponent",
				path: "ui/components/foo/component.js",
				exportName: "default"
			}
		]),
		// eslint-disable-next-line max-len
		new Error( "Duplicates found for FooComponent: ui/components/foo.js and ui/components/foo/component.js" ),
		"Throws on duplicate modules"
	);

});


test( "Build", function( assert ) {

	const expected = `
module.exports = {
	BarHelper: require("ui/components/bar.js")["helper"],
	BazTemplate: require("ui/routes/baz/template.hbs"),
	FooComponent: require("ui/components/foo.js")["default"]
};`
		.trim();

	assert.strictEqual(
		build([
			{
				name: "FooComponent",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "BarHelper",
				path: "ui/components/bar.js",
				exportName: "helper"
			},
			{
				name: "BazTemplate",
				path: "ui/routes/baz/template.hbs",
				exportName: null
			}
		]),
		expected,
		"Builds the correct module output"
	);

});
