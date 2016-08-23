import {
	get,
	setProperties,
	computed,
	Service
} from "Ember";


const { notEmpty } = computed;

const reModalName = /[A-Z]/g;

function fnModalName( a ) {
	return "-" + a.toLowerCase();
}


export default Service.extend({
	modal  : null,
	context: null,

	isModalOpened: notEmpty( "modal" ),


	openModal: function( modal, context, data ) {
		modal = "modal-" + modal.replace( reModalName, fnModalName );
		context = context || null;

		if ( context && data ) {
			setProperties( context, data );
		}

		setProperties( this, { modal, context } );
	},

	closeModal: function( context, force ) {
		var _context = get( this, "context" );
		if ( !force && _context !== null && context !== _context ) { return; }

		setProperties( this, {
			modal  : null,
			context: null
		});
	}
});
