import { helper } from "@ember/component/helper";


function boolAnd( value ) {
	return value;
}


export default helper(function( params ) {
	return params.every( boolAnd );
});
