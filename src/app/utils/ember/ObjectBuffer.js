/*
 * Based on https://github.com/movableink/buffered-proxy
 * Written by Kris Selden for Yapp Labs, published by Luke Melia
 */
import { get, set, setProperties } from "@ember/object";
import ObjectProxy from "@ember/object/proxy";


function isEmpty( obj ) {
	return !Object.keys( obj ).some( () => true );
}

function checkDirty() {
	const children = this._children;
	const dirty = get( this, "_hasChanges" )
		|| Object.keys( children ).some( key => get( children[ key ], "isDirty" ) );
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
		Object.keys( original ).forEach( key => {
			let val = get( original, key );

			// set primitives
			if ( !( val instanceof Object ) ) {
				content[ key ] = val;
				return;
			}
			// don't create buffers of buffers
			if ( val instanceof ObjectBuffer ) { return; }

			// create a child buffer for nested objects
			let childBuffer = ObjectBuffer.create({ content: val });
			set( this._children, key, childBuffer );

			this.addObserver( `_children.${key}.isDirty`, this, checkDirty );
		});

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
		const buffer = this._buffer;
		const content = this.content;
		const current = content
			? get( content, key )
			: undefined;
		const previous = buffer.hasOwnProperty( key )
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

	applyChanges( target, _isChild ) {
		const buffer = this._buffer;
		const children = this._children;
		const original = this._original;
		const content = this.content;

		if ( !( target instanceof Object ) || !target.notifyPropertyChange ) {
			target = false;
		}

		Object.keys( children ).forEach( key => {
			// notify target EmberObject if nested objects have changed
			if ( target && get( children[ key ], "_hasChanges" ) ) {
				target.notifyPropertyChange( key );
			}
			children[ key ].applyChanges( target && get( target, key ), true );
		});

		// update both content and original objects
		Object.keys( buffer ).forEach( key => {
			set( content, key, buffer[ key ] );
			set( original, key, buffer[ key ] );
		});

		this._buffer = {};
		set( this, "_hasChanges", false );

		if ( target && !_isChild ) {
			setProperties( target, this._original );
		}

		return this;
	},

	discardChanges() {
		const buffer = this._buffer;
		const children = this._children;

		Object.keys( children ).forEach( key => {
			children[ key ].discardChanges();
		});

		Object.keys( buffer ).forEach( key => {
			this.propertyWillChange( key );
			delete buffer[ key ];
			this.propertyDidChange( key );
		});

		set( this, "_hasChanges", false );

		return this;
	},

	getContent() {
		// return the original object
		return this._original;
	}
});


export default ObjectBuffer;
