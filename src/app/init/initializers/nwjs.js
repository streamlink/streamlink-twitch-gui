import Menu from "nwjs/Menu";
import Menubar from "nwjs/Menubar";
import Tray from "nwjs/Tray";


export default {
	name: "nwjs",

	initialize( application ) {
		application.register( "nwjs:menu", Menu, { singleton: false } );
		application.register( "nwjs:menubar", Menubar, { singleton: true } );
		application.register( "nwjs:tray", Tray, { singleton: true } );
	}
};
