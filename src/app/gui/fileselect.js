define( [ "jquery" ], function( $ ) {

	return function( $context ) {
		$( "[data-file]", $context ).each(function() {
			var	$btn	= $( "button", this ),
				$input	= $( ":text", this ),
				$file	= $( document.createElement( "input" ) )
					.attr({ type: "file" })
					.addClass( "hidden" )
					.insertAfter( this );

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
