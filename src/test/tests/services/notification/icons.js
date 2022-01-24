import { module, test } from "qunit";
import sinon from "sinon";
import { resolve, posix as pathPosix } from "path";

import notificationIconsMixinInjector
// eslint-disable-next-line max-len
	from "inject-loader?config&utils/node/platform&utils/node/fs/mkdirp&utils/node/fs/clearfolder&utils/node/fs/download&path!services/notification/icons";



module( "services/notification/icons", function( hooks ) {
	/** @typedef {TestContext} TestContextNotificationServiceIcons */
	/** @this {TestContextNotificationServiceIcons} */
	hooks.beforeEach(function() {
		this.mkdirpStub = sinon.stub();
		this.clearfolderStub = sinon.stub();
		this.downloadStub = sinon.stub();

		this.subject = () => notificationIconsMixinInjector({
			path: {
				resolve,
				join: pathPosix.join
			},
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
				cachedir: "/home/user/.cache/my-app"
			},
			"utils/node/fs/mkdirp": this.mkdirpStub,
			"utils/node/fs/clearfolder": this.clearfolderStub,
			"utils/node/fs/download": this.downloadStub
		});
	});


	/** @this {TestContextNotificationServiceIcons} */
	test( "iconGroup", function( assert ) {
		const { iconGroup } = this.subject();

		assert.strictEqual(
			iconGroup,
			resolve( "bigIconPath" ),
			"Exports the resolved absolute path of the iconGroup constant"
		);
	});

	/** @this {TestContextNotificationServiceIcons} */
	test( "iconDirCreate", async function( assert ) {
		const { iconDirCreate } = this.subject();
		const error = new Error();

		this.mkdirpStub.rejects( error );
		await assert.rejects( iconDirCreate(), error, "Rejects on mkdirp failure" );
		assert.ok(
			this.mkdirpStub.calledOnceWithExactly( "/home/user/.cache/my-app/icons" ),
			"Tries to create correct icon cache dir"
		);

		this.mkdirpStub.reset();
		this.mkdirpStub.resolves();
		await iconDirCreate();
		assert.ok(
			this.mkdirpStub.calledOnceWithExactly( "/home/user/.cache/my-app/icons" ),
			"Creates correct icon cache dir"
		);
	});

	/** @this {TestContextNotificationServiceIcons} */
	test( "iconDirClear", async function( assert ) {
		const { iconDirClear } = this.subject();
		const error = new Error( "fail" );

		this.clearfolderStub.rejects( error );
		await iconDirClear();
		assert.ok(
			this.clearfolderStub.calledOnceWithExactly( "/home/user/.cache/my-app/icons", 1234 ),
			"Always resolves iconDirClear"
		);

		this.clearfolderStub.reset();
		this.clearfolderStub.resolves();
		await iconDirClear();
		assert.ok(
			this.clearfolderStub.calledOnceWithExactly( "/home/user/.cache/my-app/icons", 1234 ),
			"Always resolves iconDirClear"
		);
	});

	/** @this {TestContextNotificationServiceIcons} */
	test( "iconDownload", async function( assert ) {
		const { iconDownload } = this.subject();
		const error = new Error();

		class FakeTwitchUser {
			constructor( id, icon ) {
				this.id = id;
				this.profile_image_url = icon;
			}
		}

		this.downloadStub.rejects( error );
		await assert.rejects(
			iconDownload( new FakeTwitchUser( "1", "logo1" ) ),
			error,
			"Rejects on download failure"
		);
		assert.ok(
			this.downloadStub.calledOnceWithExactly( "logo1", "/home/user/.cache/my-app/icons" ),
			"Downloads logo into cache directory"
		);

		this.downloadStub.reset();
		this.downloadStub.resolves( "file1" );
		assert.strictEqual(
			await iconDownload( new FakeTwitchUser( "1", "logo1" ) ),
			"file1",
			"Returns the file path of the downloaded icon"
		);
		assert.ok(
			this.downloadStub.calledOnceWithExactly( "logo1", "/home/user/.cache/my-app/icons" ),
			"Downloads logo into cache directory"
		);

		this.downloadStub.resetHistory();
		assert.strictEqual(
			await iconDownload( new FakeTwitchUser( "1", "logo1" ) ),
			"file1",
			"Returns the file path of the downloaded icon"
		);
		assert.notOk( this.downloadStub.called, "Doesn't try to download icons twice" );

		await iconDownload( new FakeTwitchUser( "2", "logo2" ) );
		assert.ok(
			this.downloadStub.calledOnceWithExactly( "logo2", "/home/user/.cache/my-app/icons" ),
			"Downloads second logo into cache directory"
		);
	});
});
