import LocalStorageAdapter from "ember-localstorage-adapter/adapters/ls-adapter";


export default class SettingsAdapter extends LocalStorageAdapter {
	namespace = "settings";
}
