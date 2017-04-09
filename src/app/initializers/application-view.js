import { Application } from "ember";
import ApplicationComponent from "components/ApplicationComponent";


Application.instanceInitializer({
	name: "application-view",

	initialize( application ) {
		application.register( "view:toplevel", ApplicationComponent );
	}
});
