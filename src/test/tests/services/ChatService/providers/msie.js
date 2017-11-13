import {
	module,
	test
} from "qunit";
import sinon from "sinon";
import chatProviderInjector
	from "inject-loader?-utils/parameters/Parameter!services/ChatService/providers/-provider";
import chatProviderMsieInjector
	from "inject-loader?-utils/parameters/Parameter!services/ChatService/providers/msie";


module( "services/ChatService/providers/msie", {
	beforeEach() {
		this.launch = sinon.stub();
		this.resolvePath = sinon.stub();
		this.stat = sinon.stub();
		this.whichFallback = sinon.stub();
		this.isFile = () => {};

		const { default: ChatProvider } = chatProviderInjector({
			"config": {
				"twitch": {
					"chat-url": "https://twitch.tv/{channel}/chat"
				}
			},
			"../launch": this.launch
		});

		const { default: ChatProviderMsie } = chatProviderMsieInjector({
			"./-provider": ChatProvider,
			"utils/node/resolvePath": this.resolvePath,
			"utils/node/fs/stat": {
				isFile: this.isFile,
				stat: this.stat
			},
			"utils/node/fs/whichFallback": this.whichFallback
		});

		this.subject = ChatProviderMsie;
	}
});


test( "Default attributes", async function( assert ) {

	this.resolvePath.returns( "C:\\foo\\bar" );
	this.whichFallback.returns( "C:\\baz" );

	/** @type ChatProviderMsie */
	const provider = new this.subject();
	await provider.setup({
		exec: {
			win32: "cscript.exe"
		},
		fallback: {
			win32: "%WINDIR%"
		},
		data: {
			script: "%FOO%\\bar"
		}
	});
	await provider.launch( { name: "qux" }, {} );

	assert.propEqual(
		this.whichFallback.getCall(0).args[0],
		{ win32: "cscript.exe" },
		"Resolves executable"
	);
	assert.propEqual(
		this.whichFallback.getCall(0).args[1],
		{ win32: "%WINDIR%" },
		"Has a fallback path"
	);
	assert.notOk( this.whichFallback.getCall(0).args[2], "Uses default executable check" );
	assert.ok( this.whichFallback.getCall(0).args[3], "Only checks fallback paths" );
	assert.strictEqual(
		this.resolvePath.getCall(0).args[0],
		"%FOO%\\bar",
		"Resolves script path"
	);
	assert.strictEqual( this.stat.getCall(0).args[0], "C:\\foo\\bar", "Checks script path" );
	assert.strictEqual( this.stat.getCall(0).args[1], this.isFile, "Checks whether it is a file" );
	assert.propEqual(
		this.launch.getCall(0).args,
		[
			"C:\\baz",
			[ "C:\\foo\\bar", "https://twitch.tv/qux/chat" ]
		],
		"Spawns child process and uses the correct params"
	);

});
