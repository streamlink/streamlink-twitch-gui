import {
	get,
	run
} from "Ember";
import {
	main,
	dirs
} from "config";
import Parameter from "utils/Parameter";
import ParameterCustom from "utils/ParameterCustom";
import Substitution from "utils/Substitution";
import resolvePath from "utils/node/resolvePath";
import { isWinGte8 } from "utils/node/platform";
import denodify from "utils/node/denodify";
import which from "utils/node/fs/which";
import {
	stat,
	isFile
} from "utils/node/fs/stat";
import CP from "child_process";
import FS from "fs";
import PATH from "path";


const { next } = run;
const { "display-name": displayName } = main;
const { "windows-shortcut": windowsShortcut } = dirs;


function getStartmenuShortcutPath() {
	let { dest } = windowsShortcut;

	return PATH.join(
		resolvePath.apply( null, dest ),
		`${displayName}.lnk`
	);
}

function createStartmenuShortcutWin8() {
	let {
		exec,
		args,
		script
	} = windowsShortcut;
	let target = process.execPath;
	let workingdir = PATH.dirname( target );
	script = PATH.join( workingdir, script );

	return stat( script, isFile )
		.then(function() {
			return which( exec );
		})
		.then(function( exec ) {
			let dest = getStartmenuShortcutPath();
			let context = {
				args,
				script,
				dest,
				target,
				workingdir,
				description: displayName
			};
			let paramsShortcut = [
				new ParameterCustom( null, "args", [
					new Substitution( "script", "script" ),
					new Substitution( "dest", "dest" ),
					new Substitution( "target", "target" ),
					new Substitution( "workingdir", "workingdir" ),
					new Substitution( "description", "description" ),
				])
			];
			let params = Parameter.getParameters( context, paramsShortcut, true );

			return new Promise(function( resolve, reject ) {
				let spawn = CP.spawn( exec, params, {
					detached: true,
					stdio: "ignore"
				});
				spawn.unref();
				spawn.on( "error", reject );
				next( resolve );
			});
		});
}

function removeStartmenuShortcutWin8() {
	let dest = getStartmenuShortcutPath();
	let unlink = denodify( FS.unlink );

	return stat( dest, isFile )
		.then(function() {
			return unlink( dest );
		});
}


export function createStartmenuShortcut( settings ) {
	if ( !isWinGte8 ) { return; }

	settings.addObserver( "notify_shortcut", function() {
		( !!get( settings, "notify_shortcut" )
			? createStartmenuShortcutWin8()
			: removeStartmenuShortcutWin8()
		).catch(function() {});
	});
	settings.notifyPropertyChange( "notify_shortcut" );
}
