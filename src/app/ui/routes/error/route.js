import { get, set } from "@ember/object";
import Route from "@ember/routing/route";
import { isNone } from "@ember/utils";
import { AdapterError } from "ember-data/adapters/errors";


const errorProps = [
	"name",
	"title",
	"message",
	"detail",
	"description",
	"status",
	"host",
	"path"
];

const duplicates = {
	name   : [ "title" ],
	message: [ "detail", "description" ]
};


export default Route.extend({
	/**
	 * Do all the error display stuff here instead of using an error controller.
	 * A route for errors is needed anyway.
	 * @param controller
	 * @param {Error} error
	 */
	setupController( controller, error ) {
		this._super( controller );

		error = error || new Error( "Unknown error" );

		// if it's an AdapterError, just use the first error object
		if ( error instanceof AdapterError ) {
			Object.assign( error, error.errors[0] || {} );
		}

		// choose a better error name
		if ( !error.name || error.name.toLowerCase() === "error" ) {
			error.name = error.title || error.constructor.name;
		}

		// remove duplicates
		Object.keys( duplicates ).forEach(function( key ) {
			const keys = duplicates[ key ];
			keys.forEach(function( dup ) {
				if ( error[ key ] === error[ dup ] ) {
					delete error[ dup ];
				}
			});
		});

		const props = errorProps.slice();

		// handle rejected promises with a passed Error object as reason
		const reason = get( error, "reason" );
		if ( reason instanceof Error ) {
			error = reason;
		} else if ( reason !== undefined ) {
			props.push( "reason" );
		}

		// display the callstack of non-adapter errors
		if ( DEBUG && error instanceof Error && !( error instanceof AdapterError ) ) {
			props.push( "stack" );
		}

		// create the model
		const model = props
			.filter(function( key ) {
				const value = error[ key ];
				return !isNone( value )
				    && !( value instanceof Object )
				    && String( value ).trim().length > 0
				    && value !== 0;
			})
			.map(function( key ) {
				return {
					key    : key.charAt( 0 ).toUpperCase() + key.slice( 1 ),
					value  : String( error[ key ] ),
					isStack: key === "stack"
				};
			});
		set( controller, "model", model );
	},

	deactivate() {
		set( this, "router.errorTransition", null );
	}
});
