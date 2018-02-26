import { getOwner } from "@ember/application";
import { get, setProperties, computed } from "@ember/object";
import Evented from "@ember/object/evented";
import Service from "@ember/service";


const { notEmpty } = computed;

const reModalName = /[A-Z]/g;

function fnModalName( name ) {
	name = name.toLowerCase();
	return `-${name}`;
}


export default Service.extend( Evented, {
	modal: null,
	context: null,

	isModalOpened: notEmpty( "modal" ),


	openModal( modal, context, data ) {
		const opened = get( this, "modal" );
		if ( opened ) {
			this.trigger( "close", opened, get( this, "context" ) );
		}

		const name = modal.replace( reModalName, fnModalName );
		modal = `modal-${name}`;

		if ( !getOwner( this ).hasRegistration( `component:${modal}` ) ) {
			throw new Error( `Modal component '${modal}' does not exist` );
		}

		context = context || null;
		if ( context && data ) {
			setProperties( context, data );
		}

		setProperties( this, { modal, context } );
		this.trigger( "open", modal, context );
	},

	closeModal( context, force ) {
		const _context = get( this, "context" );

		if ( force || _context === context && _context !== null ) {
			this.trigger( "close", get( this, "modal" ), _context );

			setProperties( this, {
				modal: null,
				context: null
			});
		}
	}
});
