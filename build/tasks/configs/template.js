/**
 * Factory function for creating a function to be called by the Windows installer template config
 * @param {String} config
 * @returns {Function}
 */
function getInstallerFiles( config ) {
	return function( grunt ) {
		const dir = grunt.config( `template.${config}.options.data.dirinput` );

		function getFiles( filter ) {
			return grunt.file.expand({
				cwd: dir,
				filter: filter
			}, "**" )
				.map(function( file ) {
					return file.replace( "/", "\\" );
				});
		}

		return JSON.stringify({
			files: getFiles( "isFile" ),
			directories: getFiles( "isDirectory" )
		});
	};
}


module.exports = {
	installer_win32: {
		options: {
			data: {
				dirroot    : "<%= dir.root %>",
				dirinput   : "<%= dir.releases %>/<%= package.name %>/win32",
				files      : "<%= grunt.config( 'template.installer_win32.getFiles' )( grunt ) %>",
				diroutput  : "<%= dir.dist %>",
				filename   : "<%= package.name %>-<%= version %>-win32-installer.exe",
				name       : "<%= package.name %>",
				displayname: "<%= main['display-name'] %>",
				version    : "<%= version %>",
				pkgversion : "<%= package.version %>",
				author     : "<%= package.author %>",
				homepage   : "<%= package.homepage %>",
				releaseurl : "<%= package.homepage %>/releases/v<%= package.version %>",
				arch       : "win32"
			}
		},
		getFiles: getInstallerFiles( "installer_win32" ),
		files: {
			"<%= dir.tmp_installer %>/win32installer/installer.nsi":
				"<%= dir.resources %>/installer/installer.nsi"
		}
	},
	installer_win64: {
		options: {
			data: {
				dirroot    : "<%= dir.root %>",
				dirinput   : "<%= dir.releases %>/<%= package.name %>/win64",
				files      : "<%= grunt.config( 'template.installer_win64.getFiles' )( grunt ) %>",
				diroutput  : "<%= dir.dist %>",
				filename   : "<%= package.name %>-<%= version %>-win64-installer.exe",
				name       : "<%= package.name %>",
				displayname: "<%= main['display-name'] %>",
				version    : "<%= version %>",
				pkgversion : "<%= package.version %>",
				author     : "<%= package.author %>",
				homepage   : "<%= package.homepage %>",
				releaseurl : "<%= package.homepage %>/releases/v<%= package.version %>",
				arch       : "win64"
			}
		},
		getFiles: getInstallerFiles( "installer_win64" ),
		files: {
			"<%= dir.tmp_installer %>/win64installer/installer.nsi":
				"<%= dir.resources %>/installer/installer.nsi"
		}
	},

	appimage_linux32: {
		options: {
			data: {
				dirinput: "<%= dir.releases %>/<%= package.name %>/linux32",
				diroutput: "<%= dir.dist %>",
				filename: "<%= package.name %>-<%= version %>-i686.AppImage",
				name: "<%= package.name %>",
				version: "<%= version %>",
				appimagekit: "<%= appimagekit.options.path %>",
				apprun: "<%= appimagekit.options.apprun.linux32 %>",
				appimagetool: "<%= appimagekit.options.appimagetool.linux32 %>",
				arch: "i686"
			}
		},
		files: {
			"<%= dir.tmp_appimage %>/build-linux32.sh":
				"<%= dir.resources %>/appimage/build.sh.tpl"
		}
	},
	appimage_linux64: {
		options: {
			data: {
				dirinput: "<%= dir.releases %>/<%= package.name %>/linux64",
				diroutput: "<%= dir.dist %>",
				filename: "<%= package.name %>-<%= version %>-x86_64.AppImage",
				name: "<%= package.name %>",
				version: "<%= version %>",
				appimagekit: "<%= appimagekit.options.path %>",
				apprun: "<%= appimagekit.options.apprun.linux64 %>",
				appimagetool: "<%= appimagekit.options.appimagetool.linux64 %>",
				arch: "x86_64"
			}
		},
		files: {
			"<%= dir.tmp_appimage %>/build-linux64.sh":
				"<%= dir.resources %>/appimage/build.sh.tpl"
		}
	}
};
