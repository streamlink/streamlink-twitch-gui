import metadata from "metadata";
import FragmentTransform from "ember-data-model-fragments/transforms/fragment";
import FragmentArrayTransform from "ember-data-model-fragments/transforms/fragment-array";
import ArrayTransform from "ember-data-model-fragments/transforms/array";


const Ember = window.Ember || {};
if ( Ember.libraries ) {
	const version = metadata.dependencies[ "ember-data-model-fragments" ];
	Ember.libraries.register( "Model Fragments", version );
}


export default {
	name: "fragmentTransform",
	before: "ember-data",

	initialize( application ) {
		application.inject( "transform", "store", "service:store" );
		application.register( "transform:fragment", FragmentTransform );
		application.register( "transform:fragment-array", FragmentArrayTransform );
		application.register( "transform:array", ArrayTransform );
	}
};
