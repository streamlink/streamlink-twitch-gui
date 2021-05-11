/**
 * Factory function for creating a function to be called by the Windows installer template config
 * @param {string} config
 * @returns {Function}
 */
function getInstallerFiles( config ) {
	return function( grunt ) {
		const cwd = grunt.config( `template.${config}.options.data.dirinput` );
		const getFiles = filter => grunt.file.expand( { cwd, filter }, "**" )
			.map( path => path.replace( /\//g, "\\" ) );

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
	}
};
