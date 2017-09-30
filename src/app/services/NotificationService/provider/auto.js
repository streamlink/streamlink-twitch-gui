import NotificationProvider from "./provider";


export default class NotificationProviderAuto extends NotificationProvider {
	constructor() {
		super();
	}

	static test() {
		return Promise.reject();
	}
}


NotificationProviderAuto.platforms = {
	win32: "growl",
	win32gte8: "snoretoast",
	darwin: "native",
	linux: "freedesktop"
};
