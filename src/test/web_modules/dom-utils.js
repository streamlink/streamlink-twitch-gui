export class EventTarget {
	constructor() {
		const delegate = document.createDocumentFragment();
		for ( const f of [ "addEventListener", "dispatchEvent", "removeEventListener" ] ) {
			this[ f ] = ( ...args ) => delegate[ f ]( ...args );
		}
	}
}
