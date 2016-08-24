import Ember from "Ember";


var get = Ember.get;
var run = Ember.run;
var $ = Ember.$;
var reWhiteSpace = /\s+/g;

var fixtureElement = "#qunit-fixture";


function runAppend( view ) {
	run( view, "appendTo", fixtureElement );
}

function runDestroy( destroyed ) {
	if ( destroyed ) {
		run( destroyed, "destroy" );
	}
}

function getElem( component, selector ) {
	var element = get( component, "element" );
	return selector && selector.length
		? $( selector, element )
		: $( element );
}

function getOutput( component, selector ) {
	return getElem( component, selector ).text();
}

function cleanOutput( component, selector ) {
	return getOutput( component, selector ).replace( reWhiteSpace, "" );
}

function buildOwner( properties ) {
	var Owner = Ember.Object.extend( Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
		init: function() {
			this._super.apply( this, arguments );
			var registry = new Ember.Registry( this._registryOptions );
			this.__registry__  = registry;
			this.__container__ = registry.container({ owner: this });
		}
	});

	var owner = Owner.create( properties || {} );
	owner.register( "component-lookup:main", Ember.ComponentLookup );

	return owner;
}


export default {
	fixtureElement: fixtureElement,
	runAppend: runAppend,
	runDestroy: runDestroy,
	getElem: getElem,
	getOutput: getOutput,
	cleanOutput: cleanOutput,
	buildOwner: buildOwner
};
