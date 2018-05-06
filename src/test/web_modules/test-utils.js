import GlobalsResolver from "@ember/application/globals-resolver";
import EmberObject from "@ember/object";
import Router from "@ember/routing/router";
import { run } from "@ember/runloop";
import TemplateCompiler from "ember-source/dist/ember-template-compiler";
import $ from "jquery";


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
		? $( selector, element )
		: $( element );
}

export function getOutput( component, selector ) {
	return getElem( component, selector ).text();
}

export function cleanOutput( component, selector ) {
	return getOutput( component, selector ).replace( reWhiteSpace, "" );
}

export function checkListeners( elem, event, listener ) {
	const events = $._data( elem, "events" );
	if ( events ) {
		const listeners = events[ event ];
		if ( listeners ) {
			return listeners.some( obj => obj.handler === listener );
		}
	}
	return false;
}

export function triggerKeyDown( $elem, code ) {
	const event = $.Event( "keydown" );
	Object.assign( event, { code } );
	run( () => $elem.trigger( event ) );

	return event;
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

export function buildResolver( namespace ) {
	return GlobalsResolver.create({
		namespace
	});
}
