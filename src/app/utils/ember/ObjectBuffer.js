/*
 * Based on https://github.com/movableink/buffered-proxy
 * Written by Kris Selden for Yapp Labs, published by Luke Melia
 */
import {
	get,
	set,
	ObjectProxy
} from "Ember";


function isEmpty( obj ) {
	for ( var key in obj ) {
		if ( obj.hasOwnProperty( key ) ) { return false; }
	}
	return true;
}

function checkDirty() {
	var children = this._children;
	var dirty    = get( this, "_hasChanges" )
		|| Object.keys( children ).some(function( key ) {
			return get( children[ key ], "isDirty" );
		});
	set( this, "isDirty", dirty );
}

const ObjectBuffer = ObjectProxy.extend({
	init: function() {
		this._buffer     = {};
		this._children   = {};
		this._hasChanges = false;
		this.isDirty     = false;

		this.addObserver( "_hasChanges", this, checkDirty );

		var content = this.content;
		Object.keys( content ).forEach(function( key ) {
			var obj = content[ key ];
			// don't create buffers of primitives
			if ( !( obj instanceof Object ) ) { return; }
			// don't create buffers of buffers
			if ( obj instanceof ObjectBuffer ) { return; }

			var childBuffer = ObjectBuffer.create({ content: obj });
			content[ key ] = childBuffer;
			set( this._children, key, childBuffer );

			this.addObserver( "_children." + key + ".isDirty", this, checkDirty );
		}, this );

		this._super.apply( this, arguments );
	},

	unknownProperty: function( key ) {
		var buffer = this._buffer;
		return buffer && buffer.hasOwnProperty( key )
			? buffer[ key ]
			: get( this, "content." + key );
	},

	setUnknownProperty: function( key, value ) {
		var buffer   = this._buffer;
		var content  = this.content;
		var current  = content
			? get( content, key )
			: undefined;
		var previous = buffer.hasOwnProperty( key )
			? buffer[ key ]
			: current;

		if ( previous === value ) { return value; }

		this.propertyWillChange( key );

		if ( current === value ) {
			delete buffer[ key ];
			if ( isEmpty( buffer ) ) {
				set( this, "_hasChanges", false );
			}
		} else {
			buffer[ key ] = value;
			set( this, "_hasChanges", true );
		}

		this.propertyDidChange( key );
		return value;
	},

	applyChanges: function() {
		var buffer   = this._buffer;
		var children = this._children;
		var content  = this.content;

		Object.keys( children ).forEach(function( key ) {
			children[ key ].applyChanges();
		});

		Object.keys( buffer ).forEach(function( key ) {
			set( content, key, buffer[ key ] );
		});

		this._buffer = {};
		set( this, "_hasChanges", false );

		return this;
	},

	discardChanges: function() {
		var buffer   = this._buffer;
		var children = this._children;

		Object.keys( children ).forEach(function( key ) {
			children[ key ].discardChanges();
		});

		Object.keys( buffer ).forEach(function( key ) {
			this.propertyWillChange( key );
			delete buffer[ key ];
			this.propertyDidChange( key );
		}, this );

		set( this, "_hasChanges", false );

		return this;
	},

	getContent: function() {
		var content  = this.content;
		var children = this._children;
		return Object.keys( content ).reduce(function( obj, key ) {
			obj[ key ] = children.hasOwnProperty( key )
				? children[ key ].getContent()
				: content[ key ];
			return obj;
		}, {} );
	}
});


export default ObjectBuffer;
