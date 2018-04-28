import { helper as h } from "@ember/component/helper";


export const helper = h( params =>
	params.every( ( currentValue, index, arr ) => currentValue === arr[ 0 ] )
);
