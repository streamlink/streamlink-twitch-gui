import { get } from "ember";
import { setShowInTaskbar } from "nwjs/Window";
import { setShowInTray } from "nwjs/Tray";


export default function( settings ) {
	const taskbar = get( settings, "isVisibleInTaskbar" );
	const tray = get( settings, "isVisibleInTray" );

	setShowInTaskbar( taskbar );
	setShowInTray( tray, taskbar );
}
