import LocalStorageAdapter from "ember-localstorage-adapter/adapters/ls-adapter";


export default class WindowAdapter extends LocalStorageAdapter {
	namespace = "window";
}
