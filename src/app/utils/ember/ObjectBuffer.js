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
	init() {
		this._buffer     = {};
		this._children   = {};
		this._hasChanges = false;
		this.isDirty     = false;

		this.addObserver( "_hasChanges", this, checkDirty );

		// the original object
		let original = this._original = this.content;
		// the content object with bindings, etc...
		let content = this.content = {};

		// populate content object
		Object.keys( original ).forEach(function( key ) {
			let obj = original[ key ];

			// set primitives
			if ( !( obj instanceof Object ) ) {
				content[ key ] = obj;
				return;
			}
			// don't create buffers of buffers
			if ( obj instanceof ObjectBuffer ) { return; }

			// create a child buffer for nested objects
			let childBuffer = ObjectBuffer.create({ content: obj });
			set( this._children, key, childBuffer );

			this.addObserver( `_children.${key}.isDirty`, this, checkDirty );
		}, this );

		this._super( ...arguments );
	},

	unknownProperty( key ) {
		let buffer = this._buffer;
		let children = this._children;

		// look for properties in the buffer first
		return buffer && buffer.hasOwnProperty( key )
			? buffer[ key ]
			// then try child buffers
			: children && children.hasOwnProperty( key )
				? children[ key ]
				// finally look up the content property
				: get( this, `content.${key}` );
	},

	setUnknownProperty( key, value ) {
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

	applyChanges() {
		var buffer   = this._buffer;
		var children = this._children;
		var original = this._original;
		var content  = this.content;

		Object.keys( children ).forEach(function( key ) {
			children[ key ].applyChanges();
		});

		// update both content and original objects
		Object.keys( buffer ).forEach(function( key ) {
			set( content, key, buffer[ key ] );
			set( original, key, buffer[ key ] );
		});

		this._buffer = {};
		set( this, "_hasChanges", false );

		return this;
	},

	discardChanges() {
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

	getContent() {
		// return the original object
		return this._original;
	}
});


export default ObjectBuffer;
