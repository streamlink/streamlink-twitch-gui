import { helper } from "@ember/component/helper";


function mathMul( valueA, valueB ) {
	return valueA * valueB;
}


export default helper(function( params ) {
	return params.reduce( mathMul );
});
