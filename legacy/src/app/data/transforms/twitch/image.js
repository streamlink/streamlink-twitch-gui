import Transform from "ember-data/transform";
import { vars as varsConfig } from "config";


const { "image-expiration-time": DEFAULT_EXPIRATION_TIME } = varsConfig;

const reWidth = /{width}/g;
const reHeight = /{height}/g;


/**
 * @class TwitchImage
 */
class TwitchImage {
	/**
	 * @param {string} template
	 * @param {number} width
	 * @param {number} height
	 * @param {number} expiration
	 */
	constructor( template, width, height, expiration ) {
		this.template = template;
		this.expiration = expiration;

		this.url = template
			? template.replace( reWidth, width ).replace( reHeight, height )
			: null;
		this.time = null;
	}

	/**
	 * @return {string}
	 */
	get current() {
		const { url, time } = this;

		return url === null || time === null
			? url
			: `${url}?_=${time}`;
	}

	/**
	 * @return {string}
	 */
	get latest() {
		const { url, expiration } = this;
		if ( !url || !expiration ) {
			return this.url;
		}

		const now = Date.now();
		let { time } = this;
		if ( time === null || time <= now ) {
			time = this.time = now + expiration;
		}

		return `${url}?_=${time}`;
	}

	toString() {
		return this.url;
	}
}


export default Transform.extend({
	/**
	 * @param {string} template
	 * @param {Object} options
	 * @param {number} options.width
	 * @param {number} options.height
	 * @param {(number|undefined)} options.expiration
	 * @return {TwitchImage}
	 */
	deserialize( template, options = {} ) {
		const { width, height, expiration = DEFAULT_EXPIRATION_TIME } = options;

		return new TwitchImage( template, width, height, expiration );
	},

	/**
	 * @param {TwitchImage} twitchImage
	 * @return {(string|null)}
	 */
	serialize( twitchImage ) {
		return twitchImage
			? `${twitchImage}`
			: null;
	}
});
