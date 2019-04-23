import { computed } from "@ember/object";
import attr from "ember-data/attr";
import Model from "ember-data/model";
import { name } from "utils/decorators";


@name( "releases" )
export default class GithubReleases extends Model {
	@attr
	assets;
	@attr
	assets_url;
	@attr
	author;
	@attr
	body;
	@attr
	created_at;
	@attr( "boolean" )
	draft;
	@attr( "string" )
	html_url;
	@attr
	name;
	@attr
	prerelease;
	@attr
	published_at;
	@attr( "string" )
	tag_name;
	@attr
	tarball_url;
	@attr
	target_commitish;
	@attr
	upload_url;
	@attr
	url;
	@attr
	zipball_url;

	@computed( "tag_name" )
	get version() {
		return this.tag_name.replace( /^v/, "" );
	}
}
