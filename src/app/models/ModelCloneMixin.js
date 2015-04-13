define( [ "ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	return Ember.Mixin.create({
		cloneModel: function() {
			var obj = Ember.Object.create({});

			this.eachAttribute(function( name ) {
				set( obj, name, get( this, name ) );
			}, this );

			return obj;
		},

		/**
		 * Copy back the clone's (modified) properties and save the record
		 * @param {DS.Model} clone
		 * @returns {Promise}
		 */
		setCloneAttributes: function( clone ) {
			this.eachAttribute(function( attr ) {
				set( this, attr, get( clone, attr ) );
			}, this );
			return this.save();
		},

		/**
		 * Compare attributes of both records
		 * @param {DS.Model} clone
		 * @returns {boolean}
		 */
		compareModelClone: function( clone ) {
			var equal = true;
			this.eachAttribute(function( attr ) {
				equal = equal && get( this, attr ) === get( clone, attr );
			}, this );
			return equal;
		}
	});

});
