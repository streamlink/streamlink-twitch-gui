import { helper } from "@ember/component/helper";


function boolOr( value ) {
	return value;
}


export default helper(function( params ) {
	return params.some( boolOr );
});
