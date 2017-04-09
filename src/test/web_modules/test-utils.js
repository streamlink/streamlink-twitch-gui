import Ember, {
	get,
	$,
	run,
	EmberObject
} from "ember";


const reWhiteSpace = /\s+/g;


export const fixtureElement = "#qunit-fixture";

export function runAppend( view, element ) {
	run( view, "appendTo", element || fixtureElement );
}

export function runDestroy( destroyed ) {
	if ( destroyed ) {
		run( destroyed, "destroy" );
	}
}

export function getElem( component, selector ) {
	const element = get( component, "element" );
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

export function buildOwner( properties ) {
	const Owner = EmberObject.extend( Ember._RegistryProxyMixin, Ember._ContainerProxyMixin, {
		init() {
			this._super.apply( this, arguments );
			const registry = new Ember.Registry( this._registryOptions );
			this.__registry__ = registry;
			this.__container__ = registry.container({ owner: this });
		}
	});

	const owner = Owner.create( properties || {} );
	owner.register( "component-lookup:main", Ember.ComponentLookup );

	return owner;
}
