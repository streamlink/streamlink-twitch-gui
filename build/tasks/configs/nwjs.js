const platforms = require( "../common/platforms" );

// srcDir globs are resolved relative to the "cwd" option below (see build/tasks/custom/nwjs.js),
// not to the grunt process's own cwd, so that nw-builder's file copy logic - which resolves each
// matched file's path directly against outDir without stripping any srcDir prefix - places files
// at the root of the built package instead of nesting them under a "build/tmp/prod/" subdirectory.
const srcDir = [
	"**"
];
const ignoreBinWin32 = "!bin/win32/**";
const ignoreBinWin64 = "!bin/win64/**";

const winIco = "<%= dir.resources %>/icons/icon-16-32-48-256.ico";
const macIcns = "<%= dir.resources %>/icons/icon-1024.icns";


module.exports = {
	options: {
		cwd     : "<%= dir.tmp_prod %>",
		cacheDir: "<%= dir.cache %>",
		flavor  : "normal",
		zip     : false
	},

	win32: {
		options: Object.assign( {}, platforms.getNwBuildTarget( "win32" ), {
			version: "0.83.0",
			outDir : "<%= dir.releases %>/<%= package.name %>/win32",
			srcDir : [
				...srcDir,
				ignoreBinWin64
			],
			app: {
				icon: winIco
			}
		})
	},
	win64: {
		options: Object.assign( {}, platforms.getNwBuildTarget( "win64" ), {
			version: "0.83.0",
			outDir : "<%= dir.releases %>/<%= package.name %>/win64",
			srcDir : [
				...srcDir,
				ignoreBinWin32
			],
			app: {
				icon: winIco
			}
		})
	},

	osx64: {
		options: Object.assign( {}, platforms.getNwBuildTarget( "osx64" ), {
			version: "0.83.0",
			outDir : "<%= dir.releases %>/<%= package.name %>/osx64",
			srcDir : [
				...srcDir,
				ignoreBinWin32,
				ignoreBinWin64
			],
			app: {
				icon               : macIcns,
				CFBundleIdentifier : "<%= main['app-identifier'] %>",
				CFBundleName       : "<%= main['display-name'] %>",
				CFBundleDisplayName: "<%= main['display-name'] %>"
			}
		})
	},

	linux32: {
		options: Object.assign( {}, platforms.getNwBuildTarget( "linux32" ), {
			version: "0.83.0",
			outDir : "<%= dir.releases %>/<%= package.name %>/linux32",
			srcDir : [
				...srcDir,
				ignoreBinWin32,
				ignoreBinWin64
			]
		})
	},
	linux64: {
		options: Object.assign( {}, platforms.getNwBuildTarget( "linux64" ), {
			version: "0.83.0",
			outDir : "<%= dir.releases %>/<%= package.name %>/linux64",
			srcDir : [
				...srcDir,
				ignoreBinWin32,
				ignoreBinWin64
			]
		})
	}
};
