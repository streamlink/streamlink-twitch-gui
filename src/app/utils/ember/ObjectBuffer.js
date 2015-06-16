/**
 * Based on https://github.com/movableink/buffered-proxy
 * Written by Kris Selden for Yapp Labs, published by Luke Melia
 * Slightly modified
 */
define( [ "Ember" ], function( Ember ) {

	var get = Ember.get,
	    set = Ember.set;

	function isEmpty( obj ) {
		for ( var key in obj ) {
			if ( obj.hasOwnProperty( key ) ) { return false; }
		}
		return true;
	}

	return Ember.ObjectProxy.extend({
		init: function() {
			this.bufferObject = {};
			this.hasBufferedChanges = false;

			this._super.apply( this, arguments );
		},

		unknownProperty: function( key ) {
			var buffer = this.bufferObject;
			return buffer && buffer.hasOwnProperty( key )
				? buffer[ key ]
				: get( this, "content." + key );
		},

		setUnknownProperty: function( key, value ) {
			var buffer   = this.bufferObject;
			var content  = get( this, "content" );
			var current  = content
				? get( content, key )
				: undefined;
			var previous = buffer.hasOwnProperty( key )
				? buffer[ key ]
				: current;

			if ( previous === value ) { return; }

			this.propertyWillChange( key );

			if ( current === value ) {
				delete buffer[ key ];
				if ( isEmpty( buffer ) ) {
					set( this, "hasBufferedChanges", false );
				}
			} else {
				buffer[ key ] = value;
				set( this, "hasBufferedChanges", true );
			}

			this.propertyDidChange( key );
			return value;
		},

		applyChanges: function( returnContent ) {
			var buffer  = this.bufferObject;
			var content = get( this, "content" );
			Object.keys( buffer ).forEach(function( key ) {
				set( content, key, buffer[ key ] );
			});
			this.bufferObject = {};
			set( this, "hasBufferedChanges", false );
			return returnContent ? content : this;
		},

		discardChanges: function() {
			var buffer = this.bufferObject;
			Object.keys( buffer ).forEach(function( key ) {
				this.propertyWillChange( key );
				delete buffer[ key ];
				this.propertyDidChange( key );
			}, this );
			set( this, "hasBufferedChanges", false );
			return this;
		}
	});

});
