import { get } from "@ember/object";
import { setShowInTaskbar } from "nwjs/Window";


export default function( application ) {
	const nwjs = application.lookup( "service:nwjs" );
	const settings = application.lookup( "service:settings" );
	const taskbar = get( settings, "gui.isVisibleInTaskbar" );
	const tray = get( settings, "gui.isVisibleInTray" );

	setShowInTaskbar( taskbar );
	nwjs.setShowInTray( tray );
}
