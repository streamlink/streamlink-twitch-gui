import {
	get,
	setProperties,
	computed,
	Service
} from "Ember";


const { notEmpty } = computed;

const reModalName = /[A-Z]/g;

function fnModalName( name ) {
	name = name.toLowerCase();
	return `-${name}`;
}


export default Service.extend({
	modal  : null,
	context: null,

	isModalOpened: notEmpty( "modal" ),


	openModal( modal, context, data ) {
		let name = modal.replace( reModalName, fnModalName );

		modal = `modal-${name}`;
		context = context || null;

		if ( context && data ) {
			setProperties( context, data );
		}

		setProperties( this, { modal, context } );
	},

	closeModal( context, force ) {
		const _context = get( this, "context" );
		if ( !force && _context !== null && context !== _context ) { return; }

		setProperties( this, {
			modal  : null,
			context: null
		});
	}
});
