import FromNowHelper from "helpers/-FromNowHelper";


const second = 1000;
const minute = 60 * second;
const hour   = 60 * minute;
const day    = 24 * hour;


function formatMinutes( diff, short ) {
	let minutes = Math.floor( diff / minute );

	let strZero = !short && minutes < 10 ? "0" : "";
	let strMinutes = minutes.toFixed( 0 );

	return `${strZero}${strMinutes}m`;
}

function formatHours( diff, short ) {
	let hours = Math.floor( diff / hour );
	let remaining = diff % hour;

	let strHours = hours.toFixed( 0 );
	let strMinutes = !short && remaining > minute
		? formatMinutes( remaining, true )
		: "";

	return `${strHours}h${strMinutes}`;
}

function formatDays( diff ) {
	let days = Math.floor( diff / day );
	let remaining = diff % day;

	let strDays = days.toFixed( 0 );
	let strHours = remaining > hour
		? formatHours( remaining, true )
		: "";

	return `${strDays}d${strHours}`;
}


export default FromNowHelper.extend({
	_compute( params ) {
		let diff = +new Date() - params[0];

		return diff < minute
			? "just now"
			: diff < hour
				? formatMinutes( diff )
				: diff < day
					? formatHours( diff )
					: formatDays( diff );
	}
});
