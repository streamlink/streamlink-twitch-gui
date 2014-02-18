define( [ "jquery" ], function( $ ) {

	function $$( element, classname ) {
		return $( document.createElement( element ) ).addClass( classname );
	}

	return function( $context ) {
		$( "[data-fileselect]", $context ).each(function() {
			var	$input	= $( ":text", this ),
				$grp	= $$( "div", "input-group" )
					.append( $input )
					.appendTo( this ),
				$btn	= $$( "button" )
					.attr({
						type: "button",
						tabindex: -1
					})
					.addClass( "btn fa fa-search" )
					.appendTo(
						$$( "span", "input-group-btn" )
							.appendTo( $grp )
					),
				$file	= $$( "input" )
					.attr({ type: "file" })
					.addClass( "hidden" )
					.appendTo( this );

			$btn.click(function() {
				if ( $input.is( ":disabled" ) ) return;
				$file.click();
			});
			$file.change(function() {
				$input
					// set new value
					.val( $file.val() )
					// Ember doesn't notice the previous change event for some reason
					.trigger( "change" );
			});
		});
	};

});
