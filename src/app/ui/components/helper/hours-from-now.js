import { inject as service } from "@ember/service";
import { helper as FromNowHelper } from "./-from-now";


const second = 1000;
const minute = 60 * second;
const hour   = 60 * minute;
const day    = 24 * hour;


export const helper = class HoursFromNowHelper extends FromNowHelper {
	/** @type {I18nService} */
	@service i18n;
	/** @type {SettingsService} */
	@service settings;

	_compute( [ time = 0 ] ) {
		const diff = Date.now() - time;

		if ( diff < minute / 2 ) {
			return this.i18n.t( "helpers.hours-from-now.now" ).toString();

		} else if ( diff < hour ) {
			const minutes = diff < minute
				? 1
				: Math.floor( diff / minute );

			return this.i18n.t( "helpers.hours-from-now.minutes", {
				minutes: minutes < 10
					? `0${minutes.toFixed()}`
					: minutes.toFixed()
			}).toString();

		} else if ( diff < day || this.settings.content.streams.uptime_hours_only ) {
			const remaining = diff % hour;

			if ( remaining > minute ) {
				return this.i18n.t( "helpers.hours-from-now.hours.extended", {
					hours: Math.floor( diff / hour ).toFixed(),
					minutes: Math.floor( remaining / minute ).toFixed()
				}).toString();

			} else {
				return this.i18n.t( "helpers.hours-from-now.hours.simple", {
					hours: Math.floor( diff / hour ).toFixed()
				}).toString();
			}

		} else {
			const remaining = diff % day;

			if ( remaining > hour ) {
				return this.i18n.t( "helpers.hours-from-now.days.extended", {
					days: Math.floor( diff / day ).toFixed(),
					hours: Math.floor( remaining / hour ).toFixed()
				}).toString();

			} else {
				return this.i18n.t( "helpers.hours-from-now.days.simple", {
					days: Math.floor( diff / day ).toFixed()
				}).toString();
			}
		}
	}
};
