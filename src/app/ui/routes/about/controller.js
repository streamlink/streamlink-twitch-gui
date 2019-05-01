import Controller from "@ember/controller";
import { main as mainConfig, locales as localesConfig } from "config";
import metadata from "metadata";
import { manifest } from "nwjs/App";
import { arch } from "utils/node/platform";
import "./styles.less";


export default class AboutController extends Controller {
	mainConfig = mainConfig;
	localesConfig = localesConfig;
	metadata = metadata;
	arch = arch;
	releaseUrl = mainConfig.urls.release.replace( "{version}", manifest.version );
}
