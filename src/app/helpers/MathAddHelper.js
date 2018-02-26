import { helper } from "@ember/component/helper";


function mathAdd( valueA, valueB ) {
	return valueA + valueB;
}


export default helper(function( params ) {
	return params.reduce( mathAdd );
});
