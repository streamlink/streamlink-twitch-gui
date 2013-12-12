define(function() {

	return function() {
		var selectable = true;

		document.addEventListener( "selectstart", function( e ) {
			if ( selectable ) {
				selectable = false;

				var el = e.target;
				do {
					if ( el.dataset && "selectable" in el.dataset ) {
						return;
					}
				} while ( el = el.parentNode );
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
	};

});
