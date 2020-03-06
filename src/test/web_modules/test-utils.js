import Application from "@ember/application";
import GlobalsResolver from "@ember/application/globals-resolver";
import EmberObject from "@ember/object";
import Router from "@ember/routing/router";
import { run } from "@ember/runloop";
import { getApplication, setApplication, getResolver, setResolver } from "@ember/test-helpers";
import TemplateCompiler from "ember-source/dist/ember-template-compiler";


const { compile } = TemplateCompiler;
const Ember = window.Ember;
const reWhiteSpace = /\s+/g;


export function runDestroy( destroyed ) {
	if ( destroyed ) {
		run( destroyed, "destroy" );
	}
}

export function getElem( component, selector ) {
	const element = component.element || component._element;
	return selector && selector.length
		? element.querySelector( selector )
		: element;
}

export function getOutput( component, selector ) {
	return getElem( component, selector ).innerText;
}

export function cleanOutput( component, selector ) {
	return getOutput( component, selector ).replace( reWhiteSpace, "" );
}


function exposeRegistryMethodsWithoutDeprecations( container ) {
	const methods = [
		"register",
		"unregister",
		"resolve",
		"normalize",
		"typeInjection",
		"injection",
		"factoryInjection",
		"factoryTypeInjection",
		"has",
		"options",
		"optionsForType"
	];

	function exposeRegistryMethod( container, method ) {
		if ( method in container ) {
			container[ method ] = function() {
				return container._registry[ method ].apply( container._registry, arguments );
			};
		}
	}

	for ( let i = 0, l = methods.length; i < l; i++ ) {
		exposeRegistryMethod( container, methods[ i ] );
	}
}

export function buildOwner( resolver ) {
	let fallbackRegistry, registry, container;
	const namespace = EmberObject.create({
		Resolver: { create() { return resolver; } }
	});

	fallbackRegistry = Ember.Application.buildRegistry( namespace );
	fallbackRegistry.register( "component-lookup:main", Ember.ComponentLookup );

	fallbackRegistry.register( "router:main", Router.extend({
		location: "none"
	}) );

	registry = new Ember.Registry({
		fallback: fallbackRegistry
	});

	Ember.ApplicationInstance.setupRegistry( registry );

	// these properties are set on the fallback registry by `buildRegistry`
	// and on the primary registry within the ApplicationInstance constructor
	// but we need to manually recreate them since ApplicationInstance's are not
	// exposed externally
	registry.normalizeFullName = fallbackRegistry.normalizeFullName;
	registry.makeToString = fallbackRegistry.makeToString;
	registry.describe = fallbackRegistry.describe;

	const Owner = EmberObject.extend( Ember._RegistryProxyMixin, Ember._ContainerProxyMixin );
	const owner = Owner.create({
		__registry__: registry,
		__container__: null
	});

	container = registry.container({ owner: owner });
	owner.__container__ = container;

	exposeRegistryMethodsWithoutDeprecations( container );

	return owner;
}


/**
 * @param {String[]} strings
 * @param {...*} vars
 */
export function hbs( strings, ...vars ) {
	const arr = [ ...strings ];
	const l = vars.length;
	for ( let i = 0; i < l; i++ ) {
		arr.splice( 2 * i + 1, 0, String( vars[ i ] ) );
	}

	return compile( arr.join( "" ) );
}

export function buildResolver( namespace = {} ) {
	return GlobalsResolver.create({
		namespace
	});
}

export function buildFakeApplication( hooks, options, namespace ) {
	if ( !namespace ) {
		namespace = options;
		options = {};
	}

	const methodBefore = options.each ? "beforeEach" : "before";
	const methodAfter = options.each ? "afterEach" : "after";

	let oldApplication;
	let oldResolver;

	hooks[ methodBefore ](function() {
		oldApplication = getApplication();
		oldResolver = getResolver();

		const resolver = buildResolver( namespace );
		const application = Application.extend().create({
			autoboot: false,
			rootElement: "#ember-testing",
			Resolver: {
				create: () => resolver
			}
		});

		setResolver( resolver );
		setApplication( application );
	});

	hooks[ methodAfter ](function() {
		setApplication( oldApplication );
		setResolver( oldResolver );
	});
}
