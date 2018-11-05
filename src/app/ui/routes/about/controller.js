import Controller from "@ember/controller";
import { main as config, locales as localesConfig } from "config";
import metadata from "metadata";
import { arch } from "utils/node/platform";
import "./styles.less";


const { urls: { release: releaseUrl } } = config;
const { package: { version }, dependencies } = metadata;


export default Controller.extend({
	metadata,
	config,
	localesConfig,

	arch,

	releaseUrl: releaseUrl.replace( "{version}", version ),

	dependencies: Object.keys( dependencies ).map( key => ({
		title: key,
		version: dependencies[ key ]
	}) )
});
