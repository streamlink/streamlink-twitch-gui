import { get } from "@ember/object";
import DS from "ember-data";
import cloneDeep from "lodash/cloneDeep";
import sinon from "sinon";
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
	registry.injection( "controller", "store", "service:store" );
	registry.injection( "route", "store", "service:store" );
	registry.injection( "data-adapter", "store", "service:store" );

	env.restSerializer = container.lookup( "serializer:-rest" );
	env.store = container.lookup( "service:store" );
	env.serializer = env.store.serializerFor( "-default" );
	env.adapter = env.store.get( "defaultAdapter" );

	return env;
}


function adapterRequest( assert, obj, url, method, query ) {
	/* istanbul ignore next */
	if ( !obj ) {
		throw new Error( "Missing request object" );
	}

	// filter out undefined values from queries, as those can't be set in YAML
	let queryData;
	/* istanbul ignore if */
	if ( !query || !query.data ) {
		queryData = query;
	} else if ( Array.isArray( query.data ) ) {
		queryData = query.data.filter( ({ value }) => value !== undefined );
	} else {
		queryData = Object.fromEntries( Object.entries( query.data )
			.filter( ( [ , value ] ) => value !== undefined )
		);
	}

	assert.strictEqual( url, obj.request.url, "Correct request url" );
	assert.strictEqual( method, obj.request.method, "Correct request method" );
	assert.propEqual(
		queryData,
		obj.request.query || /* istanbul ignore next */ undefined,
		`Correct request query for URL: ${url}`
	);

	return Promise.resolve( cloneDeep( obj.response ) );
}


export function adapterRequestFactory( assert, fixtures, mapper = null ) {
	const mapperType = typeof mapper;
	if ( mapperType === "string" ) {
		const key = mapper;
		mapper = obj => get( obj, key );
	} else /* istanbul ignore else */ if ( mapperType !== "function" ) {
		mapper = obj => obj;
	}

	const getCallback = data => ( ...args ) => adapterRequest(
		assert,
		mapper( data, responseStub ),
		...args
	);
	const responseStub = sinon.stub();

	if ( Array.isArray( fixtures ) ) {
		for ( const [ idx, item ] of fixtures.entries() ) {
			responseStub.onCall( idx ).callsFake( getCallback( item ) );
		}
		return responseStub;
	}

	return responseStub.callsFake( getCallback( fixtures ) );
}


/**
 * @param {QUnit.assert} assert
 * @param {DS.Model} model
 * @param {Object} expected
 * @param {string} expected.key
 * @param {"belongsTo"|"hasMany"} expected.kind
 * @param {string} expected.type
 * @param {Object?} expected.options
 */
export function assertRelationships( assert, model, expected ) {
	assert.propEqual(
		Object.values( model.relationshipsObject )
			.map( ({ meta: { key, kind, type, options } }) => ({ key, kind, type, options }) ),
		expected,
		"Has the correct model relationships"
	);
}
