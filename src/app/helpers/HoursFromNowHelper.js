define([
	"helpers/-FromNowHelper"
], function(
	FromNowHelper
) {

	var second = 1000;
	var minute = 60 * second;
	var hour   = 60 * minute;
	var day    = 24 * hour;

	function formatMinutes( diff, short ) {
		var minutes = Math.floor( diff / minute );
		return ( !short && minutes < 10 ? "0" : "" ) + minutes.toFixed( 0 ) + "m";
	}

	function formatHours( diff, short ) {
		var hours     = Math.floor( diff / hour );
		var remaining = diff % hour;
		return hours.toFixed( 0 ) + "h"
			+ ( !short && remaining > minute ? formatMinutes( remaining, true ) : "" );
	}

	function formatDays( diff ) {
		var days      = Math.floor( diff / day );
		var remaining = diff % day;
		return days.toFixed( 0 ) + "d"
			+ ( remaining > hour ? formatHours( remaining, true ) : "" );
	}


	return FromNowHelper.extend({
		_compute: function( params ) {
			var diff = +new Date() - params[0];
			return diff < minute
				? "just now"
				: diff < hour
					? formatMinutes( diff )
					: diff < day
						? formatHours( diff )
						: formatDays( diff );
		}
	});

});
