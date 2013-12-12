define(function() {

	return function() {
		var	content		= document.body.querySelector( ".content" ),
			observer	= new MutationObserver(function( mutations ) {
				mutations.forEach(function( mutation ) {
					var elem = mutation.addedNodes[ 0 ];
					if ( elem && elem.tagName === "SECTION" ) {
						addScrollEvent( elem );
					}
				})
			});
		observer.observe( content, { childList: true } );

		addScrollEvent( content.querySelector( "section" ) );

		function addScrollEvent( elem ) {
			elem.addEventListener( "scroll", onscroll.bind( null, elem ), false );
		}

		function onscroll( elem ) {
			content.classList[ elem.scrollTop === 0
				? "remove"
				: "add" ]( "scrollborder-top" );
			content.classList[ elem.offsetHeight - ( elem.scrollHeight - elem.scrollTop ) >= -1
				? "remove"
				: "add" ]( "scrollborder-bottom" );
		}
	};

});
