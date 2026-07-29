import Application from "@ember/application";
import Router from "./router";
import app from "ember-app";


export default Application.create( app, {
	rootElement: "body",
	Router,

	toString() { return "App"; }
});
