import { JSONSerializer } from "ember-data";
import {
	players,
	typeKey
} from "./streamingPlayer";


const { hasOwnProperty } = {};


export default JSONSerializer.extend({
	/**
	 * @param {Snapshot} snapshot
	 * @param {Model} snapshot.record
	 * @returns {Object}
	 */
	serialize({ record }) {
		const json = this._super( ...arguments );

		for ( const [ type, model ] of players ) {
			if ( record instanceof model ) {
				json[ typeKey ] = `settings-streaming-player-${type}`;
				break;
			}
		}

		return json;
	},

	/**
	 * Fix removal of the `typeKey` property
	 * @param {Model} modelClass
	 * @param {Object} [data]
	 * @returns {Object}
	 */
	extractAttributes( modelClass, data ) {
		const attributes = this._super( ...arguments );
		if ( data && hasOwnProperty.call( data, typeKey ) ) {
			attributes[ typeKey ] = data[ typeKey ];
		}

		return attributes;
	}
});
