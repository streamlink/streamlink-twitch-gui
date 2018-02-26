import { main as mainConfig, notification as notificationConfig } from "config";
import growly from "growly";
import { connect } from "net";


const { "display-name": displayName } = mainConfig;
const {
	provider: {
		growl: {
			host,
			ports,
			timeout
		}
	}
} = notificationConfig;

const reClick = /^click(ed)?$/i;


/**
 * Growl notifications
 *
 * Use "growly" module for all growl server communication
 *
 * @class NotificationProviderGrowl
 * @implements NotificationProvider
 */
export default class NotificationProviderGrowl {
	static isSupported() {
		return true;
	}

	async setup() {
		for ( let port of ports ) {
			try {
				await NotificationProviderGrowl.checkConnection( port );
				growly.setHost( host, port );
				await NotificationProviderGrowl.register();
				return;
			} catch ( e ) {}
		}
		throw new Error( "Could not find growl server" );
	}

	/**
	 * @param {number} port
	 * @returns {Promise}
	 */
	static checkConnection( port ) {
		let connection;
		return new Promise( ( resolve, reject ) => {
			connection = connect( port, host );
			connection.setTimeout( timeout );
			connection.once( "error", reject );
			connection.once( "connect", resolve );
		})
			.finally( () => connection.end() );
	}

	static register() {
		return new Promise( ( resolve, reject ) => {
			growly.register( displayName, "", [{ label: displayName }], err => {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			});
		});
	}

	/**
	 * @param {NotificationData} data
	 * @returns {Promise}
	 */
	async notify( data ) {
		await new Promise( ( resolve, reject ) => {
			growly.notify( data.getMessageAsString(), {
				label: displayName,
				title: data.title,
				icon: data.icon
			}, ( err, action ) => {
				if ( err ) {
					reject( err );
				} else {
					if ( reClick.test( action ) && data.click ) {
						data.click();
					}
					resolve();
				}
			});
		});
	}
}
