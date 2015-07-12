define( [ "JQuery", "Selecter" ], function() {

	return function( $select ) {
		var	classnames = [].slice.call( $select[0].classList )
				.without( "ember-view" )
				.without( "ember-select" );

		$select.selecter({
			customClass: "custom" + ( classnames.length ? " " + classnames.join( " " ) : "" ),
			cover: true
		});
	};

});
