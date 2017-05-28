import "shim";
import { Application } from "ember";

import "initializers";
import modules from "./app-modules";


export default Application.create( modules, {
	rootElement: document.documentElement,

	toString() { return "App"; }
});
