import { get, set, setProperties } from "@ember/object";
import Evented from "@ember/object/evented";
import ObjectProxy from "@ember/object/proxy";


const { hasOwnProperty } = {};

const bufferMap = new WeakMap();
const parentMap = new WeakMap();
const childrenMap = new WeakMap();
const originalMap = new WeakMap();
const hasChangesMap = new WeakMap();


function setIsDirty( obj ) {
	// an objectbuffer is dirty if it has changes or if one of its children is dirty
	const dirty = hasChangesMap.get( obj )
		|| Object.values( childrenMap.get( obj ) ).some( child => child.isDirty );

	// if objectbuffer is dirty, so are all its parents
	if ( dirty ) {
		let current = obj;
		do {
			set( current, "isDirty", true );
		} while ( ( current = parentMap.get( current ) ) );

	// if it's not dirty, its parent needs to be re-checked
	} else {
		set( obj, "isDirty", false );
		const parent = parentMap.get( obj );
		if ( parent ) {
			setIsDirty( parent );
		}
	}
}

function setHasChanges( obj, hasChanges ) {
	hasChangesMap.set( obj, hasChanges );
	setIsDirty( obj );
}

function triggerChange( buffer ) {
	do {
		buffer.trigger( "change" );
		buffer = parentMap.get( buffer );
	} while ( buffer );
}


class ObjectBuffer extends ObjectProxy.extend( Evented ) {
	isDirty = false;

	init() {
		const constructor = this.constructor;

		const children = {};
		bufferMap.set( this, {} );
		childrenMap.set( this, children );

		setHasChanges( this, false );

		// the original object
		const original = this.content;
		originalMap.set( this, original );
		// the content object with bindings, etc...
		const content = this.content = {};

		// populate content object and create child buffers
		for ( const key of Object.keys( original ) ) {
			const val = get( original, key );

			// set primitives
			if ( !( val instanceof Object ) ) {
				content[ key ] = val;
				continue;
			}
			// don't create buffers of buffers
			if ( val instanceof constructor ) { continue; }

			// create a child buffer for nested objects
			const childBuffer = constructor.create({ content: val });
			parentMap.set( childBuffer, this );
			set( children, key, childBuffer );
		}

		super.init( ...arguments );
	}

	unknownProperty( key ) {
		// look for properties in the buffer first
		const buffer = bufferMap.get( this );
		if ( hasOwnProperty.call( buffer, key ) ) {
			return buffer[ key ];
		}

		// then try child buffers
		const children = childrenMap.get( this );
		if ( hasOwnProperty.call( children, key ) ) {
			return children[ key ];
		}

		// finally look up the content property
		return get( this.content, key );
	}

	setUnknownProperty( key, value ) {
		const buffer = bufferMap.get( this );
		const current = get( this.content, key );
		const previous = hasOwnProperty.call( buffer, key )
			? buffer[ key ]
			: current;

		if ( previous === value ) {
			return value;
		}

		if ( current === value ) {
			delete buffer[ key ];
			if ( !Object.keys( buffer ).length ) {
				setHasChanges( this, false );
			}
		} else {
			buffer[ key ] = value;
			setHasChanges( this, true );
		}

		this.notifyPropertyChange( key );
		triggerChange( this );

		return value;
	}

	applyChanges( target, _isChild = false, _trigger = true ) {
		const buffer = bufferMap.get( this );
		const children = childrenMap.get( this );
		const original = originalMap.get( this );
		const content = this.content;

		if ( !( target instanceof Object ) || !target.notifyPropertyChange ) {
			target = false;
		}

		for ( const [ key, child ] of Object.entries( children ) ) {
			// notify target EmberObject if nested objects have changed
			if ( target && hasChangesMap.get( child ) ) {
				target.notifyPropertyChange( key );
			}
			child.applyChanges( target && get( target, key ), true, false );
		}

		// update both content and original objects
		for ( const [ key, value ] of Object.entries( buffer ) ) {
			set( content, key, value );
			set( original, key, value );
		}

		bufferMap.set( this, {} );
		setHasChanges( this, false );

		if ( target && !_isChild ) {
			setProperties( target, originalMap.get( this ) );
		}
		if ( _trigger ) {
			triggerChange( this );
		}

		return this;
	}

	discardChanges( _trigger = true ) {
		const buffer = bufferMap.get( this );
		const children = childrenMap.get( this );

		for ( const child of Object.values( children ) ) {
			child.discardChanges( false );
		}

		for ( const key of Object.keys( buffer ) ) {
			delete buffer[ key ];
			this.notifyPropertyChange( key );
		}

		setHasChanges( this, false );
		if ( _trigger ) {
			triggerChange( this );
		}

		return this;
	}

	getOriginal() {
		// return the original object
		return originalMap.get( this );
	}

	getContent() {
		// return a new object with all modified properties and children
		return Object.assign(
			{},
			originalMap.get( this ),
			bufferMap.get( this ),
			Object.entries( childrenMap.get( this ) ).reduce( ( children, [ key, child ] ) => {
				children[ key ] = child.getContent();
				return children;
			}, {} )
		);
	}
}


export default ObjectBuffer;
