import {
	set,
	Component
} from "Ember";
import layout from "templates/components/PreviewImageComponent.hbs";


export default Component.extend({
	layout,

	classNames: [],
	error: false,

	checkError: function() {
		var self = this;
		var img  = this.element.querySelector( "img" );

		function unbind() {
			img.removeEventListener( "error", onError, false );
			img.removeEventListener( "load",  onLoad,  false );
		}

		function onError() {
			unbind();
			set( self, "error", true );
		}

		function onLoad() {
			unbind();
		}

		img.addEventListener( "error", onError, false );
		img.addEventListener( "load",  onLoad,  false );
	}.on( "willInsertElement" )
});
