import Ember from "ember";


window.requirejs = {
	entries: Ember.__loader.registry
};


export default Ember.__loader.require;
