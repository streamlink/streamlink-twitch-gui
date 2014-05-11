define( [ "jquery", "Selecter" ], function() {

	return function( $select ) {
		$select.selecter({
			customClass: "custom",
			cover: true
		});
	};

});
