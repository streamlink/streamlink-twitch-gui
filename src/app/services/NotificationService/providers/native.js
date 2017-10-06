import NotificationProvider from "./provider";


export default class NotificationProviderNative extends NotificationProvider {
	constructor() {
		super();
	}

	static test() {
		return Promise.resolve();
	}

	notify( data ) {
		return new Promise( ( resolve, reject ) => {
			let notification = new window.Notification( data.title, {
				body: NotificationProvider.getMessageAsString( data.message ),
				icon: `file://${data.icon}`,
				actions: []
			});

			notification.addEventListener( "error", reject );
			notification.addEventListener( "click", data.click );

			resolve();
		});
	}
}


// native notification are currently only supported on MacOS>=mountainlion
NotificationProviderNative.platforms = {
	mountainlion: "growl"
};
