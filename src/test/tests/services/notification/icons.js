import { module, test } from "qunit";

import notificationIconsMixinInjector
// eslint-disable-next-line max-len
	from "inject-loader?config&utils/node/platform&utils/node/resolvePath&utils/node/fs/mkdirp&utils/node/fs/clearfolder&utils/node/fs/download!services/notification/icons";


module( "services/notification/icons" );


test( "NotificationService icons", async assert => {

	assert.expect( 10 );

	const config = {
		files: { icons: { big: "bigIconPath" } },
		notification: {
			cache: {
				dir: "iconCacheDir",
				time: 1234
			}
		}
	};

	let callsClear = 0;
	const {
		iconGroup,
		iconDirCreate,
		iconDirClear,
		iconDownload
	} = notificationIconsMixinInjector({
		config,
		"utils/node/platform": {
			isWin: false,
			tmpdir( dir ) {
				assert.strictEqual( dir, "iconCacheDir", "Calls tmpdir" );
				return dir;
			}
		},
		"utils/node/resolvePath": ( ...paths ) => {
			assert.propEqual( paths, [ "bigIconPath" ], "Calls resolvePath" );
			return paths.join( "/" );
		},
		"utils/node/fs/mkdirp": dir => {
			assert.strictEqual( dir, "iconCacheDir", "Calls mkdirp" );
		},
		"utils/node/fs/clearfolder": ( dir, time ) => {
			if ( ++callsClear > 1 ) {
				throw new Error();
			}
			assert.strictEqual( dir, "iconCacheDir", "Calls clearfolder" );
			assert.strictEqual( time, 1234, "Clears with correct cache time" );
		},
		"utils/node/fs/download": ( url, dir ) => {
			assert.strictEqual( url, "logo", "Calls download" );
			assert.strictEqual( dir, "iconCacheDir", "Downloads into correct dir" );
			return "file";
		}
	});

	assert.strictEqual( iconGroup, "bigIconPath", "Exports the correct iconGroup constant" );

	await iconDirCreate();

	await iconDirClear();
	// ignore errors
	await iconDirClear();

	let stream = { channel: { logo: "logo" } };
	await iconDownload( stream );
	assert.strictEqual( stream.logo, "file", "Sets the logo property on the stream record" );

	// don't download twice
	await iconDownload( stream );


	notificationIconsMixinInjector({
		config,
		"utils/node/platform": {
			isWin: true,
			tmpdir() {}
		},
		"utils/node/resolvePath": ( ...paths ) => {
			assert.propEqual(
				paths,
				[ "%NWJSAPPPATH%", "bigIconPath" ],
				"Exports the correct iconGroup constant on Windows"
			);
		}
	});

});
