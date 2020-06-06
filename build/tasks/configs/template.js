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
				filename   : "<%= package.name %>-v<%= package.version %>-win32-installer.exe",
				name       : "<%= package.name %>",
				displayname: "<%= main['display-name'] %>",
				version    : "<%= package.version %>",
				author     : "<%= package.author %>",
				homepage   : "<%= package.homepage %>",
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
				filename   : "<%= package.name %>-v<%= package.version %>-win64-installer.exe",
				name       : "<%= package.name %>",
				displayname: "<%= main['display-name'] %>",
				version    : "<%= package.version %>",
				author     : "<%= package.author %>",
				homepage   : "<%= package.homepage %>",
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
