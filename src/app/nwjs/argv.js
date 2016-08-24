import nwGui from "nwjs/nwGui";
import contains from "utils/contains";


var argv = nwGui.App.fullArgv;


export default {
	"tray": contains.some.call( argv, "--tray", "--hide", "--hidden" ),
	"max" : contains.some.call( argv, "--max", "--maximize", "--maximized" ),
	"min" : contains.some.call( argv, "--min", "--minimize", "--minimized" ),
	"resetwindow": contains.some.call( argv, "--reset-window" ),
	"versioncheck": !contains.some.call( argv, "--no-version-check" )
};
