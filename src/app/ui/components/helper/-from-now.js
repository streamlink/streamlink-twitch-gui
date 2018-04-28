import Helper from "@ember/component/helper";
import { cancel, later } from "@ember/runloop";


export const helper = Helper.extend({
	compute( params, hash ) {
		if ( hash.interval ) {
			this._interval = later( this, "recompute", hash.interval );
		}

		return this._compute( ...arguments );
	},

	destroy() {
		if ( this._interval ) {
			cancel( this._interval );
		}

		this._super( ...arguments );
	}
});
