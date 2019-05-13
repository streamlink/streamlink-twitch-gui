import Helper from "@ember/component/helper";
import { run } from "@ember/runloop";


export const helper = class FromNowHelper extends Helper {
	compute( params, hash ) {
		if ( hash.interval ) {
			this._interval = setTimeout( () => run( () => this.recompute() ), hash.interval );
		}

		return this._compute( ...arguments );
	}

	destroy() {
		if ( this._interval ) {
			clearTimeout( this._interval );
			this._interval = null;
		}

		this._super( ...arguments );
	}
};
