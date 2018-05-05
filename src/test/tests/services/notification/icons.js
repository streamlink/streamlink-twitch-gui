import { module, test } from "qunit";
import sinon from "sinon";
import { posix as path } from "path";

import notificationIconsMixinInjector
// eslint-disable-next-line max-len
	from "inject-loader?config&utils/node/platform&utils/node/resolvePath&utils/node/fs/mkdirp&utils/node/fs/clearfolder&utils/node/fs/download&path!services/notification/icons";



module( "services/notification/icons", {
	beforeEach() {
		this.resolvePathStub = sinon.stub().callsFake( ( ...paths ) => paths.join( "/" ) );
		this.mkdirpStub = sinon.stub();
		this.clearfolderStub = sinon.stub();
		this.downloadStub = sinon.stub();

		this.subject = isWin => notificationIconsMixinInjector({
			path,
			config: {
				files: {
					icons: {
						big: "bigIconPath"
					}
				},
				notification: {
					cache: {
						dir: "icons",
						time: 1234
					}
				}
			},
			"utils/node/platform": {
				isWin,
				cachedir: "/home/user/.cache/my-app"
			},
			"utils/node/resolvePath": this.resolvePathStub,
			"utils/node/fs/mkdirp": this.mkdirpStub,
			"utils/node/fs/clearfolder": this.clearfolderStub,
			"utils/node/fs/download": this.downloadStub
		});
	}
});


test( "NotificationService icons", async function( assert ) {

	const error = new Error( "fail" );

	const {
		iconGroup,
		iconDirCreate,
		iconDirClear,
		iconDownload
	} = this.subject( false );

	assert.strictEqual( iconGroup, "bigIconPath", "Exports the correct iconGroup constant" );

	this.mkdirpStub.rejects( error );
	await assert.rejects( iconDirCreate(), error, "Rejects on mkdirp failure" );
	assert.ok(
		this.mkdirpStub.calledWithExactly( "/home/user/.cache/my-app/icons" ),
		"Tries to create correct icon cache dir"
	);

	this.mkdirpStub.reset();
	this.mkdirpStub.resolves();
	await iconDirCreate();
	assert.ok(
		this.mkdirpStub.calledWithExactly( "/home/user/.cache/my-app/icons" ),
		"Creates correct icon cache dir"
	);

	this.clearfolderStub.rejects( error );
	await iconDirClear();
	assert.ok(
		this.clearfolderStub.calledWithExactly( "/home/user/.cache/my-app/icons", 1234 ),
		"Always resolves iconDirClear"
	);

	this.clearfolderStub.reset();
	this.clearfolderStub.resolves();
	await iconDirClear();
	assert.ok(
		this.clearfolderStub.calledWithExactly( "/home/user/.cache/my-app/icons", 1234 ),
		"Always resolves iconDirClear"
	);

	const stream = { channel: { logo: "logo-url" } };
	this.downloadStub.rejects( error );
	await assert.rejects(
		iconDownload( stream ),
		error,
		"Rejects on download failure"
	);
	assert.ok(
		this.downloadStub.calledWithExactly( "logo-url", "/home/user/.cache/my-app/icons" ),
		"Downloads logo into cache directory"
	);
	assert.strictEqual( stream.logo, undefined, "Doesn't set logo property on failure" );

	this.downloadStub.reset();
	this.downloadStub.resolves( "file-path" );
	await iconDownload( stream );
	assert.ok(
		this.downloadStub.calledWithExactly( "logo-url", "/home/user/.cache/my-app/icons" ),
		"Downloads logo into cache directory"
	);
	assert.strictEqual( stream.logo, "file-path", "Sets the logo property on the stream record" );

	this.downloadStub.resetHistory();
	await iconDownload( stream );
	assert.notOk( this.downloadStub.called, "Doesn't try to download icons twice" );

});


test( "Windows icon path", async function( assert ) {

	const { iconGroup } = this.subject( true );

	assert.strictEqual(
		iconGroup,
		"%NWJSAPPPATH%/bigIconPath",
		"Exports the correct iconGroup constant on Windows"
	);

});
