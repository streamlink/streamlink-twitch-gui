global._noQUnitBridge = true;

import "./dev.css";
import "./main";
import nwGui from "nw.gui";


const nwWindow = nwGui.Window.get();


nwWindow.show();
nwWindow.showDevTools();
