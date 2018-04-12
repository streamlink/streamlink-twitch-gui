import DS from "ember-data";
import "init/initializers/store";


export function setupStore( owner, options ) {
	options = options || {};

	const env = {};
	const {
		__container__: container,
		__registry__: registry
	} = owner;

	let adapter = ( options.adapter || "-default" );
	if ( typeof adapter !== "string" ) {
		registry.register( "adapter:-ember-data-test-custom", adapter );
		adapter = "-ember-data-test-custom";
	}

	registry.optionsForType( "serializer", { singleton: false } );
	registry.optionsForType( "adapter", { singleton: false } );

	registry.register( "serializer:-default", DS.JSONSerializer );
	registry.register( "serializer:-rest", DS.RESTSerializer );
	registry.register( "serializer:-json-api", DS.JSONAPISerializer );

	registry.register( "adapter:-default", DS.Adapter );
	registry.register( "adapter:-rest", DS.RESTAdapter );
	registry.register( "adapter:-json-api", DS.JSONAPIAdapter );

	registry.register( "transform:boolean", DS.BooleanTransform );
	registry.register( "transform:date", DS.DateTransform );
	registry.register( "transform:number", DS.NumberTransform );
	registry.register( "transform:string", DS.StringTransform );

	registry.register( "service:store", DS.Store.extend({ adapter }) );

	env.restSerializer = container.lookup( "serializer:-rest" );
	env.store = container.lookup( "service:store" );
	env.serializer = env.store.serializerFor( "-default" );
	env.adapter = env.store.get( "defaultAdapter" );

	return env;
}


export function adapterRequest( assert, obj, url, method, query ) {
	if ( !obj ) {
		throw new Error( "Missing request object" );
	}

	assert.strictEqual( url, obj.request.url, "Correct request url" );
	assert.strictEqual( method, obj.request.method, "Correct request method" );
	assert.deepEqual(
		query && query.data || query,
		obj.request.query || undefined,
		"Correct request query"
	);

	return Promise.resolve( obj.response );
}
