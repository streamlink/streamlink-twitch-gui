const { isArray } = Array;


/**
 * @typedef {Object} NotificationDataMessageList
 * @property {string} title
 * @property {string} message
 */


/**
 * @class NotificationData
 * @property {string} title
 * @property {(string|NotificationDataMessageList[])} message
 * @property {string} icon
 * @property {Function} click
 * @property {(*)?} settings
 */
export default class NotificationData {
	constructor({ title, message, icon, click, settings }) {
		this.title = title;
		this.message = message;
		this.icon = icon;
		this.click = click;
		this.settings = settings;
	}

	/**
	 * @returns {string}
	 */
	getMessageAsString() {
		return isArray( this.message )
			? this.message.map( message => message.title ).join( ", " )
			: this.message;
	}

	/**
	 * @returns {string}
	 */
	getIconAsFileURI() {
		return `file://${this.icon}`;
	}
}
