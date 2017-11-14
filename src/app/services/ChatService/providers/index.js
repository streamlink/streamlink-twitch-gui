import ChatProviderBrowser from "./browser";
import ChatProviderChromium from "./chromium";
import ChatProviderChrome from "./chrome";
import ChatProviderMsie from "./msie";
import ChatProviderChatty from "./chatty";
import ChatProviderChattyStandalone from "./chatty-standalone";
import ChatProviderCustom from "./custom";


export default {
	"browser": ChatProviderBrowser,
	"chromium": ChatProviderChromium,
	"chrome": ChatProviderChrome,
	"msie": ChatProviderMsie,
	"chatty": ChatProviderChatty,
	"chatty-standalone": ChatProviderChattyStandalone,
	"custom": ChatProviderCustom
};
