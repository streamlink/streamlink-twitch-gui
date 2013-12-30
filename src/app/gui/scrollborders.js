define(function() {

	return function() {
		var	content		= document.body.querySelector( ".content" ),
			elem		= null,
			observer	= new MutationObserver(function( mutations ) {
				content.classList.remove( "scrollborder-top" );
				content.classList.remove( "scrollborder-bottom" );
				mutations.forEach(function( mutation ) {
					var el = mutation.addedNodes[ 0 ];
					if ( el && el.tagName === "SECTION" ) {
						addScrollEvent( el );
					}
				})
			});

		observer.observe( content, { childList: true } );

		window.addEventListener( "resize", applyClasses, false );

		addScrollEvent( content.querySelector( "section" ) );

		function addScrollEvent( el ) {
			if ( !el ) return;
			elem = el;
			el.addEventListener( "scroll", applyClasses, false );
		}

		function applyClasses() {
			if ( !elem ) return;
			content.classList[ elem.scrollTop === 0
				? "remove"
				: "add" ]( "scrollborder-top" );
			content.classList[ elem.offsetHeight - ( elem.scrollHeight - elem.scrollTop ) >= -1
				? "remove"
				: "add" ]( "scrollborder-bottom" );
		}
	};

});
