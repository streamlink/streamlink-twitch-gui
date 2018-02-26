import { helper } from "@ember/component/helper";


function boolNot( value ) {
	return !value;
}


export default helper(function( params ) {
	return params.every( boolNot );
});
