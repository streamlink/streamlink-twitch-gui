export default function() {
	let selectable = true;

	document.addEventListener( "selectstart", function( e ) {
		if ( selectable ) {
			selectable = false;

			let el = e.target;
			if ( /input|textarea/i.test( el.tagName ) ) {
				return;
			}
			do {
				if ( el.dataset && "selectable" in el.dataset ) {
					return;
				}
			} while ( ( el = el.parentNode ) );
		}
		e.preventDefault();
		e.stopImmediatePropagation();
	}, false );

	document.addEventListener( "mouseup", function() {
		selectable = true;
	}, false );

	document.addEventListener( "dragstart", function( e ) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}, false );
}
