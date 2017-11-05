const { hasOwnProperty } = {};


export function moveAttributes( settings, attributes ) {
	for ( const [ oldAttr, newAttrPath ] of Object.entries( attributes ) ) {
		if ( !hasOwnProperty.call( settings, oldAttr ) ) { continue; }
		const path = newAttrPath.split( "." );
		const newAttr = path.pop();
		let obj = settings;
		for ( const elem of path ) {
			if ( !hasOwnProperty.call( obj, elem ) ) {
				obj[ elem ] = {};
			}
			obj = obj[ elem ];
		}
		obj[ newAttr ] = settings[ oldAttr ];
		delete settings[ oldAttr ];
	}
}


// Similar to moveAttributes, but faster (everything belongs to the same fragment)
export function moveAttributesIntoFragment( settings, fragment, attributes ) {
	if ( !hasOwnProperty.call( settings, fragment ) ) {
		settings[ fragment ] = {};
	}
	const fragmentObj = settings[ fragment ];
	for ( const [ oldAttr, newAttr ] of Object.entries( attributes ) ) {
		if ( !hasOwnProperty.call( settings, oldAttr ) ) { continue; }
		fragmentObj[ newAttr ] = settings[ oldAttr ];
		delete settings[ oldAttr ];
	}
}


export function qualityIdToName( obj, qualities ) {
	if ( !hasOwnProperty.call( obj, "quality" ) ) { return; }

	let { quality } = obj;
	if ( !hasOwnProperty.call( qualities, quality ) ) {
		quality = 0;
	}

	obj.quality = qualities[ quality ].id;
}
