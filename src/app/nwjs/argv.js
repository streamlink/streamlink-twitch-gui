define([
	"nwjs/nwGui",
	"utils/contains"
], function(
	nwGui,
	contains
) {

	var argv = nwGui.App.fullArgv;


	return {
		"tray": contains.some.call( argv, "--tray", "--hide", "--hidden" ),
		"max" : contains.some.call( argv, "--max", "--maximize", "--maximized" ),
		"min" : contains.some.call( argv, "--min", "--minimize", "--minimized" ),
		"resetwindow": contains.some.call( argv, "--reset-window" ),
		"versioncheck": !contains.some.call( argv, "--no-version-check" )
	};

});
