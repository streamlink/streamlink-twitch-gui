import {
	ArrayTransform,
	FragmentArrayTransform,
	FragmentTransform
} from "model-fragments";


export default {
	name: "fragmentTransform",
	before: "ember-data",

	initialize( application ) {
		application.register( "transform:fragment", FragmentTransform );
		application.register( "transform:fragment-array", FragmentArrayTransform );
		application.register( "transform:array", ArrayTransform );
	}
};
