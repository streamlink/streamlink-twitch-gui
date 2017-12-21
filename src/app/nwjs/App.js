import { App } from "./nwGui";
import Process from "./process";


App.removeAllListeners( "open" );


export default App;

export const argv = App.argv;
export const filteredArgv = App.filteredArgv;
export const manifest = App.manifest;


export function quit() {
	try {
		// manually emit the process's exit event
		Process.emit( "exit" );
	} catch ( e ) {}
	App.quit();
}
