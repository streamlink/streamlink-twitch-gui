import Ember from "Ember";


	export default Ember.Helper.helper(function( params, hash ) {
		return params[ hash.index ];
	});
