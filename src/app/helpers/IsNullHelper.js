import { helper } from "@ember/component/helper";


function isNull( currentValue ) {
	return currentValue === null;
}


export default helper(function( params ) {
	return params.every( isNull );
});
