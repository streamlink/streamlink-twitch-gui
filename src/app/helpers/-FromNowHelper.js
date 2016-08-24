import {
	run,
	Helper
} from "Ember";


const { cancel, later } = run;


export default Helper.extend({
	compute( params, hash ) {
		if ( hash.interval ) {
			this._interval = later( this, "recompute", hash.interval );
		}

		return this._compute.apply( this, arguments );
	},

	destroy() {
		if ( this._interval ) {
			cancel( this._interval );
		}

		this._super.apply( this, arguments );
	}
});
