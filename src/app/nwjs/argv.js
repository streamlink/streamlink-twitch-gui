import { App } from "nwjs/nwGui";
import { some } from "utils/contains";


const { fullArgv: argv } = App;


export default argv;

export const tray = some.call( argv, "--tray", "--hide", "--hidden" );
export const max = some.call( argv, "--max", "--maximize", "--maximized" );
export const min = some.call( argv, "--min", "--minimize", "--minimized" );
export const resetwindow = some.call( argv, "--reset-window" );
export const versioncheck = !some.call( argv, "--no-version-check" );
