import { helper } from "@ember/component/helper";


export default helper(function( params, hash ) {
	return params[ hash.index ];
});
