import { App } from "nwjs/nwGui";


App.removeAllListeners( "open" );


export default App;

export const argv = App.argv;
export const filteredArgv = App.filteredArgv;
export const manifest = App.manifest;
