import { helper } from "@ember/component/helper";


function mathDiv( valueA, valueB ) {
	return valueA / valueB;
}


export default helper(function( params ) {
	return params.reduce( mathDiv );
});
