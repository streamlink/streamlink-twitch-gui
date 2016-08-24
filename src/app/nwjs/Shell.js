import { Shell } from "nwjs/nwGui";


const { openExternal } = Shell;


export function openBrowser( url ) {
	openExternal( url );
}
