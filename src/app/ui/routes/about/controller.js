import Controller from "@ember/controller";
import { main as mainConfig, locales as localesConfig } from "config";
import metadata from "metadata";
import { manifest } from "nwjs/App";
import { platform, release, arch } from "utils/node/platform";
import "./styles.less";


export default Controller.extend({
	mainConfig,
	localesConfig,
	metadata,
	platform,
	release,
	arch,
	releaseUrl: mainConfig.urls.release.replace( "{version}", manifest.version )
});
