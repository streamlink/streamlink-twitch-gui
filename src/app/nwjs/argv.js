import minimist from "minimist";
import { App } from "nwjs/nwGui";


const ARG_TRAY = "tray";
const ARG_MAX = "max";
const ARG_MIN = "min";
const ARG_RESET_WINDOW = "reset-window";
const ARG_VERSIONCHECK = "versioncheck";
const ARG_LOGLEVEL = "loglevel";
const ARG_LOGFILE = "logfile";


const { fullArgv: argv } = App;

const parsed = minimist( argv, {
	boolean: [
		ARG_TRAY,
		ARG_MAX,
		ARG_MIN,
		ARG_RESET_WINDOW,
		ARG_VERSIONCHECK,
		ARG_LOGFILE
	],
	string: [
		ARG_LOGLEVEL
	],
	alias: {
		[ ARG_TRAY ]: [ "hide", "hidden" ],
		[ ARG_MAX ]: [ "maximize", "maximized" ],
		[ ARG_MIN ]: [ "minimize", "maximized" ],
		[ ARG_LOGLEVEL ]: [ "l" ]
	},
	default: {
		[ ARG_VERSIONCHECK ]: true,
		[ ARG_LOGLEVEL ]: "",
		[ ARG_LOGFILE ]: true
	}
});


export default parsed;


export const tray = parsed[ ARG_TRAY ];
export const max = parsed[ ARG_MAX ];
export const min = parsed[ ARG_MIN ];
export const resetwindow = parsed[ ARG_RESET_WINDOW ];
export const versioncheck = parsed[ ARG_VERSIONCHECK ];
export const loglevel = parsed[ ARG_LOGLEVEL ];
export const logfile = parsed[ ARG_LOGFILE ];
