import LocalStorageAdapter from "ember-localstorage-adapter/adapters/ls-adapter";


export default class AuthAdapter extends LocalStorageAdapter {
	namespace = "auth";
}
