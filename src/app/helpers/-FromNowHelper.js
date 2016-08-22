import Ember from "Ember";


	var later  = Ember.run.later;
	var cancel = Ember.run.cancel;


	export default Ember.Helper.extend({
		compute: function( params, hash ) {
			if ( hash.interval ) {
				this._interval = later( this, "recompute", hash.interval );
			}

			return this._compute.apply( this, arguments );
		},

		destroy: function() {
			if ( this._interval ) {
				cancel( this._interval );
			}

			this._super.apply( this, arguments );
		}
	});
