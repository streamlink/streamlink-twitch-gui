import { helper } from "@ember/component/helper";


function isEqual( currentValue, index, arr ) {
	return currentValue === arr[ 0 ];
}


export default helper(function( params ) {
	return params.every( isEqual );
});
