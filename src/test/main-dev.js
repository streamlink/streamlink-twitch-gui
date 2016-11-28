global._noQUnitBridge = true;

import "./main";
import { start } from "QUnit";
import nwGui from "nw.gui";


const nwWindow = nwGui.Window.get();


nwWindow.show();
nwWindow.showDevTools();

start();
