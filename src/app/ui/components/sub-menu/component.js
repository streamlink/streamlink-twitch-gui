import Component from "@ember/component";
import { classNames, layout, tagName } from "@ember-decorators/component";
import template from "./template.hbs";
import "./styles.less";


@layout( template )
@tagName( "ul" )
@classNames( "sub-menu-component" )
export default class SubMenuComponent extends Component {
	static positionalParams = [ "baseroute", "menus" ];

	baseroute = null;
	menus = null;
}
