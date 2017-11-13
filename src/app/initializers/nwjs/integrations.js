import { get } from "ember";
import { setShowInTaskbar } from "nwjs/Window";
import { setShowInTray } from "nwjs/Tray";


export default function( settings ) {
	const taskbar = get( settings, "gui.isVisibleInTaskbar" );
	const tray = get( settings, "gui.isVisibleInTray" );

	setShowInTaskbar( taskbar );
	setShowInTray( tray, taskbar );
}
