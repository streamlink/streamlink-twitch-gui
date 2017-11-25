import "shim";
import { Application } from "ember";
import "./logger";
import "./initializers";
import modules from "./app-modules";


export default Application.create( modules, {
	rootElement: "body",

	toString() { return "App"; }
});
