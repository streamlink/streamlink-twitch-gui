import { module, test } from "qunit";

import parse from "root/web_loaders/ember-app-loader/parse";
import checkDuplicates from "root/web_loaders/ember-app-loader/check-duplicates";
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
			"ui/components/foo/initializer.js": [ "default" ],
			"ui/components/foo/instance-initializer.js": [ "default" ],
			"ui/components/foo/adapter.js": [ "default" ],
			"ui/components/foo/fragment.js": [ "default" ],
			"ui/components/foo/model.js": [ "default" ],
			"ui/components/foo/serializer.js": [ "default" ],
			"ui/components/foo/controller.js": [ "default" ],
			"ui/components/foo/route.js": [ "default" ],
			"ui/components/foo/template.hbs": [ "default" ],
			"ui/components/foo/service.js": [ "default" ],
			"ui/components/foo/transform.js": [ "default" ]
		}),
		[
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo/component.js",
				exportName: "default"
			},
			{
				name: "FooHelper",
				type: "helper",
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
			"data/models/foo/initializer.js": [ "default" ],
			"data/models/foo/instance-initializer.js": [ "default" ],
			"data/models/foo/adapter.js": [ "default" ],
			"data/models/foo/fragment.js": [ "default" ],
			"data/models/foo/model.js": [ "default" ],
			"data/models/foo/serializer.js": [ "default" ],
			"data/models/foo/controller.js": [ "default" ],
			"data/models/foo/route.js": [ "default" ],
			"data/models/foo/template.hbs": [ "default" ],
			"data/models/foo/service.js": [ "default" ],
			"data/models/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			false,
			false,
			{
				name: "FooAdapter",
				type: "adapter",
				path: "data/models/foo/adapter.js",
				exportName: "default"
			},
			{
				name: "Foo",
				type: "fragment",
				path: "data/models/foo/fragment.js",
				exportName: "default"
			},
			{
				name: "Foo",
				type: "model",
				path: "data/models/foo/model.js",
				exportName: "default"
			},
			{
				name: "FooSerializer",
				type: "serializer",
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
			"ui/routes/foo/initializer.js": [ "default" ],
			"ui/routes/foo/instance-initializer.js": [ "default" ],
			"ui/routes/foo/adapter.js": [ "default" ],
			"ui/routes/foo/fragment.js": [ "default" ],
			"ui/routes/foo/model.js": [ "default" ],
			"ui/routes/foo/serializer.js": [ "default" ],
			"ui/routes/foo/controller.js": [ "default" ],
			"ui/routes/foo/route.js": [ "default" ],
			"ui/routes/foo/template.hbs": [ "default" ],
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
			false,
			false,
			{
				name: "FooController",
				type: "controller",
				path: "ui/routes/foo/controller.js",
				exportName: "default"
			},
			{
				name: "FooRoute",
				type: "route",
				path: "ui/routes/foo/route.js",
				exportName: "default"
			},
			{
				name: "FooTemplate",
				type: "template",
				path: "ui/routes/foo/template.hbs",
				exportName: "default"
			},
			false,
			false
		],
		"Explicit types in the routes collection"
	);

	assert.propEqual(
		await this.subject({
			"init/initializers/foo/component.js": [ "default" ],
			"init/initializers/foo/helper.js": [ "default" ],
			"init/initializers/foo/initializer.js": [ "default" ],
			"init/initializers/foo/instance-initializer.js": [ "default" ],
			"init/initializers/foo/adapter.js": [ "default" ],
			"init/initializers/foo/fragment.js": [ "default" ],
			"init/initializers/foo/model.js": [ "default" ],
			"init/initializers/foo/serializer.js": [ "default" ],
			"init/initializers/foo/controller.js": [ "default" ],
			"init/initializers/foo/route.js": [ "default" ],
			"init/initializers/foo/template.hbs": [ "default" ],
			"init/initializers/foo/service.js": [ "default" ],
			"init/initializers/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo/initializer.js",
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
			false,
			false
		],
		"Explicit types in the initializers collection"
	);

	assert.propEqual(
		await this.subject({
			"init/instance-initializers/foo/component.js": [ "default" ],
			"init/instance-initializers/foo/helper.js": [ "default" ],
			"init/instance-initializers/foo/initializer.js": [ "default" ],
			"init/instance-initializers/foo/instance-initializer.js": [ "default" ],
			"init/instance-initializers/foo/adapter.js": [ "default" ],
			"init/instance-initializers/foo/fragment.js": [ "default" ],
			"init/instance-initializers/foo/model.js": [ "default" ],
			"init/instance-initializers/foo/serializer.js": [ "default" ],
			"init/instance-initializers/foo/controller.js": [ "default" ],
			"init/instance-initializers/foo/route.js": [ "default" ],
			"init/instance-initializers/foo/template.hbs": [ "default" ],
			"init/instance-initializers/foo/service.js": [ "default" ],
			"init/instance-initializers/foo/transform.js": [ "default" ]
		}),
		[
			false,
			false,
			false,
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo/instance-initializer.js",
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
		"Explicit types in the instance-initializers collection"
	);

	assert.propEqual(
		await this.subject({
			"services/foo/component.js": [ "default" ],
			"services/foo/helper.js": [ "default" ],
			"services/foo/initializer.js": [ "default" ],
			"services/foo/instance-initializer.js": [ "default" ],
			"services/foo/adapter.js": [ "default" ],
			"services/foo/fragment.js": [ "default" ],
			"services/foo/model.js": [ "default" ],
			"services/foo/serializer.js": [ "default" ],
			"services/foo/controller.js": [ "default" ],
			"services/foo/route.js": [ "default" ],
			"services/foo/template.hbs": [ "default" ],
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
			false,
			false,
			{
				name: "FooService",
				type: "service",
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
			"data/transforms/foo/initializer.js": [ "default" ],
			"data/transforms/foo/instance-initializer.js": [ "default" ],
			"data/transforms/foo/adapter.js": [ "default" ],
			"data/transforms/foo/fragment.js": [ "default" ],
			"data/transforms/foo/model.js": [ "default" ],
			"data/transforms/foo/serializer.js": [ "default" ],
			"data/transforms/foo/controller.js": [ "default" ],
			"data/transforms/foo/route.js": [ "default" ],
			"data/transforms/foo/template.hbs": [ "default" ],
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
			false,
			false,
			{
				name: "FooTransform",
				type: "transform",
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
			"data/models/foo/model.js": [ "model" ]
		}),
		new Error( "Invalid export of module: data/models/foo/model.js" ),
		"Rejects on missing default export"
	);

});


test( "Default collection types", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"data/models/foo.js": [ "default" ],
			"data/transforms/foo.js": [ "default" ],
			"init/initializers/foo.js": [ "default" ],
			"init/instance-initializers/foo.js": [ "default" ],
			"ui/components/foo.js": [ "default" ],
			"ui/routes/foo.js": [ "default" ],
			"services/foo.js": [ "default" ]
		}),
		[
			{
				name: "Foo",
				type: "model",
				path: "data/models/foo.js",
				exportName: "default"
			},
			{
				name: "FooTransform",
				type: "transform",
				path: "data/transforms/foo.js",
				exportName: "default"
			},
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo.js",
				exportName: "default"
			},
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo.js",
				exportName: "default"
			},
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "FooRoute",
				type: "route",
				path: "ui/routes/foo.js",
				exportName: "default"
			},
			{
				name: "FooService",
				type: "service",
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
			"init/initializers/foo.js": [ "initializer" ],
			"init/instance-initializers/foo.js": [ "instance-initializer" ],
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
				type: "adapter",
				path: "data/models/foo.js",
				exportName: "adapter"
			},
			{
				name: "Bar",
				type: "fragment",
				path: "data/models/bar.js",
				exportName: "fragment"
			},
			{
				name: "Baz",
				type: "model",
				path: "data/models/baz.js",
				exportName: "model"
			},
			{
				name: "QuxSerializer",
				type: "serializer",
				path: "data/models/qux.js",
				exportName: "serializer"
			},
			{
				name: "FooTransform",
				type: "transform",
				path: "data/transforms/foo.js",
				exportName: "transform"
			},
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo.js",
				exportName: "initializer"
			},
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo.js",
				exportName: "instance-initializer"
			},
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo.js",
				exportName: "component"
			},
			{
				name: "BarHelper",
				type: "helper",
				path: "ui/components/bar.js",
				exportName: "helper"
			},
			{
				name: "FooController",
				type: "controller",
				path: "ui/routes/foo.js",
				exportName: "controller"
			},
			{
				name: "BarRoute",
				type: "route",
				path: "ui/routes/bar.js",
				exportName: "route"
			},
			{
				name: "BazTemplate",
				type: "template",
				path: "ui/routes/baz.hbs",
				exportName: "template"
			},
			{
				name: "FooService",
				type: "service",
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


test( "CommonJS modules", async function( assert ) {

	assert.propEqual(
		await this.subject({
			"ui/components/foo/component.js": [],
			"ui/components/foo/helper.js": [],
			"init/initializers/foo/initializer.js": [],
			"init/instance-initializers/foo/instance-initializer.js": [],
			"data/models/foo/adapter.js": [],
			"data/models/foo/fragment.js": [],
			"data/models/foo/model.js": [],
			"data/models/foo/serializer.js": [],
			"ui/routes/foo/controller.js": [],
			"ui/routes/foo/route.js": [],
			"ui/routes/foo/template.hbs": [],
			"services/foo/service.js": [],
			"data/transforms/foo/transform.js": []
		}),
		[
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo/component.js",
				exportName: null
			},
			{
				name: "FooHelper",
				type: "helper",
				path: "ui/components/foo/helper.js",
				exportName: null
			},
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo/initializer.js",
				exportName: null
			},
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo/instance-initializer.js",
				exportName: null
			},
			{
				name: "FooAdapter",
				type: "adapter",
				path: "data/models/foo/adapter.js",
				exportName: null
			},
			{
				name: "Foo",
				type: "fragment",
				path: "data/models/foo/fragment.js",
				exportName: null
			},
			{
				name: "Foo",
				type: "model",
				path: "data/models/foo/model.js",
				exportName: null
			},
			{
				name: "FooSerializer",
				type: "serializer",
				path: "data/models/foo/serializer.js",
				exportName: null
			},
			{
				name: "FooController",
				type: "controller",
				path: "ui/routes/foo/controller.js",
				exportName: null
			},
			{
				name: "FooRoute",
				type: "route",
				path: "ui/routes/foo/route.js",
				exportName: null
			},
			{
				name: "FooTemplate",
				type: "template",
				path: "ui/routes/foo/template.hbs",
				exportName: null
			},
			{
				name: "FooService",
				type: "service",
				path: "services/foo/service.js",
				exportName: null
			},
			{
				name: "FooTransform",
				type: "transform",
				path: "data/transforms/foo/transform.js",
				exportName: null
			}
		],
		"Explicit types with CommonJS modules"
	);

	assert.propEqual(
		await this.subject({
			"ui/components/foo.js": [],
			"init/initializers/foo.js": [],
			"init/instance-initializers/foo.js": [],
			"data/models/foo.js": [],
			"ui/routes/foo.js": [],
			"services/foo.js": [],
			"data/transforms/foo.js": []
		}),
		[
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo.js",
				exportName: null
			},
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo.js",
				exportName: null
			},
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo.js",
				exportName: null
			},
			{
				name: "Foo",
				type: "model",
				path: "data/models/foo.js",
				exportName: null
			},
			{
				name: "FooRoute",
				type: "route",
				path: "ui/routes/foo.js",
				exportName: null
			},
			{
				name: "FooService",
				type: "service",
				path: "services/foo.js",
				exportName: null
			},
			{
				name: "FooTransform",
				type: "transform",
				path: "data/transforms/foo.js",
				exportName: null
			}
		],
		"Implicit types with CommonJS modules"
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
			"ui/routes/foo/bar/baz/template.hbs": [ "default" ],
			"services/foo/bar/baz/service.js": [ "default" ]
		}),
		[
			{
				name: "FooBarBazAdapter",
				type: "adapter",
				path: "data/models/foo/bar/baz/adapter.js",
				exportName: "default"
			},
			{
				name: "FooBarBaz",
				type: "fragment",
				path: "data/models/foo/bar/baz/fragment.js",
				exportName: "default"
			},
			{
				name: "FooBarBaz",
				type: "model",
				path: "data/models/foo/bar/baz/model.js",
				exportName: "default"
			},
			{
				name: "FooBarBazSerializer",
				type: "serializer",
				path: "data/models/foo/bar/baz/serializer.js",
				exportName: "default"
			},
			{
				name: "FooBarBazTransform",
				type: "transform",
				path: "data/transforms/foo/bar/baz/transform.js",
				exportName: "default"
			},
			{
				name: "BazComponent",
				type: "component",
				path: "ui/components/foo/bar/baz/component.js",
				exportName: "default"
			},
			{
				name: "BazHelper",
				type: "helper",
				path: "ui/components/foo/bar/baz/helper.js",
				exportName: "default"
			},
			{
				name: "FooBarBazController",
				type: "controller",
				path: "ui/routes/foo/bar/baz/controller.js",
				exportName: "default"
			},
			{
				name: "FooBarBazRoute",
				type: "route",
				path: "ui/routes/foo/bar/baz/route.js",
				exportName: "default"
			},
			{
				name: "FooBarBazTemplate",
				type: "template",
				path: "ui/routes/foo/bar/baz/template.hbs",
				exportName: "default"
			},
			{
				name: "FooBarBazService",
				type: "service",
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
				type: "component",
				path: "ui/components/foo-bar/component.js",
				exportName: "default"
			},
			{
				name: "BazComponent",
				type: "component",
				path: "ui/components/foo-bar/baz.js",
				exportName: "component"
			},
			{
				name: "FooBarRoute",
				type: "route",
				path: "ui/routes/foo-bar/route.js",
				exportName: "default"
			},
			{
				name: "FooBarBazRoute",
				type: "route",
				path: "ui/routes/foo-bar/baz.js",
				exportName: "route"
			}
		],
		"Applies camel case to segments with dashes and respects collection nesting configuration"
	);

});


test( "Duplicates", function( assert ) {

	assert.throws(
		() => checkDuplicates([
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo/component.js",
				exportName: "default"
			}
		]),
		// eslint-disable-next-line max-len
		new Error( "Duplicates found for FooComponent: ui/components/foo.js and ui/components/foo/component.js" ),
		"Throws on duplicate modules"
	);

	const modules = [
		{
			name: "Baz",
			type: "route",
			path: "ui/routes/baz.js",
			exportName: "default"
		},
		{
			name: "FooComponent",
			type: "component",
			path: "ui/components/foo.js",
			exportName: "default"
		},
		{
			name: "Bar",
			type: "model",
			path: "data/models/bar.js",
			exportName: "default"
		}
	];
	assert.propEqual( checkDuplicates( modules ), modules, "Keeps the sort order" );

});


test( "Build", function( assert ) {

	const expected = `
const {Application} = require("ember").default;


Application.initializer(require("init/initializers/foo.js")["default"]);
Application.initializer(require("init/initializers/bar.js")["initializer"]);
Application.instanceInitializer(require("init/instance-initializers/foo.js")["default"]);
Application.instanceInitializer(require("init/instance-initializers/bar.js"));


export default {
	FooComponent: require("ui/components/foo.js")["default"],
	BarHelper: require("ui/components/bar.js")["helper"],
	BazTemplate: require("ui/routes/baz/template.hbs")
};`
		.trim();

	assert.strictEqual(
		build([
			{
				name: "FooInitializer",
				type: "initializer",
				path: "init/initializers/foo.js",
				exportName: "default"
			},
			{
				name: "BarInitializer",
				type: "initializer",
				path: "init/initializers/bar.js",
				exportName: "initializer"
			},
			{
				name: "FooInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/foo.js",
				exportName: "default"
			},
			{
				name: "BarInstanceinitializer",
				type: "instance-initializer",
				path: "init/instance-initializers/bar.js",
				exportName: null
			},
			{
				name: "FooComponent",
				type: "component",
				path: "ui/components/foo.js",
				exportName: "default"
			},
			{
				name: "BarHelper",
				type: "helper",
				path: "ui/components/bar.js",
				exportName: "helper"
			},
			{
				name: "BazTemplate",
				type: "template",
				path: "ui/routes/baz/template.hbs",
				exportName: null
			}
		]),
		expected,
		"Builds the correct module output"
	);

});
