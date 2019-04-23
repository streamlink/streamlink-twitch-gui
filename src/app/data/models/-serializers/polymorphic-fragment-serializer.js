import JSONSerializer from "ember-data/serializers/json";


const { hasOwnProperty } = {};


export default class PolymorphicFragmentSerializer extends JSONSerializer {
	/**
	 * @param {Snapshot} snapshot
	 * @param {Model} snapshot.record
	 * @returns {Object}
	 */
	serialize({ record }) {
		const json = super.serialize( ...arguments );
		const { models, modelBaseName, typeKey } = this;

		for ( const [ type, model ] of models ) {
			if ( record instanceof model ) {
				json[ typeKey ] = `${modelBaseName}-${type}`;
				break;
			}
		}

		return json;
	}

	/**
	 * Fix removal of the `typeKey` property
	 * @param {Model} modelClass
	 * @param {Object} [data]
	 * @returns {Object}
	 */
	extractAttributes( modelClass, data ) {
		const { typeKey } = this;
		const attributes = super.extractAttributes( ...arguments );
		if ( data && hasOwnProperty.call( data, typeKey ) ) {
			attributes[ typeKey ] = data[ typeKey ];
		}

		return attributes;
	}
}
