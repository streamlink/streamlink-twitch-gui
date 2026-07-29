import { get, set } from "@ember/object";
import Mixin from "@ember/object/mixin";


export default Mixin.create({
	/**
	 * Retry a previously stored transition
	 * @param {string?} route
	 * @returns {Promise}
	 */
	retryTransition( route ) {
		const transition = get( this, "previousTransition" );

		if ( !transition ) {
			return route
				? this.transitionToRoute( route )
				: Promise.resolve();
		}

		set( this, "previousTransition", null );
		return transition.retry();
	}
});
