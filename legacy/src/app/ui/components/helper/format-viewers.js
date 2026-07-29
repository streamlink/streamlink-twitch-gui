import { helper as h } from "@ember/component/helper";


export const helper = h( params => {
	const viewers = Number( params[ 0 ] );

	return isNaN( viewers )
		? "0"
		: viewers >= 1000000
		? `${( Math.floor( viewers / 10000 ) / 100 ).toFixed( 2 )}m`
		: viewers >= 100000
		? `${( Math.floor( viewers / 1000 ) ).toFixed( 0 )}k`
		: viewers >= 10000
		? `${( Math.floor( viewers / 100 ) / 10 ).toFixed( 1 )}k`
		: viewers.toFixed( 0 );
});
