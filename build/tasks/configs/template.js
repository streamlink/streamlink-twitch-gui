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
	releases: {
		options: {
			data: {
				display_name: "<%= main['display-name'] %>",
				version: "<%= package.version %>",
				homepage: "<%= package.homepage %>",
				changelog: "<%= releases.changelog %>",
				donation: "<%= JSON.stringify( main['donation'] ) %>"
			}
		},
		files: {
			"<%= dir.travis %>/data/releases.md": "<%= dir.travis %>/templates/releases.md"
		}
	},

	win32installer: {
		options: {
			data: {
				dirroot    : "<%= dir.root %>",
				dirinput   : "<%= dir.releases %>/<%= package.name %>/win32",
				files      : "<%= grunt.config( 'template.win32installer.getFiles' )( grunt ) %>",
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
		getFiles: getInstallerFiles( "win32installer" ),
		files: {
			"<%= dir.tmp_installer %>/win32installer/installer.nsi":
				"<%= dir.resources %>/installer/installer.nsi"
		}
	},

	win64installer: {
		options: {
			data: {
				dirroot    : "<%= dir.root %>",
				dirinput   : "<%= dir.releases %>/<%= package.name %>/win64",
				files      : "<%= grunt.config( 'template.win64installer.getFiles' )( grunt ) %>",
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
		getFiles: getInstallerFiles( "win64installer" ),
		files: {
			"<%= dir.tmp_installer %>/win64installer/installer.nsi":
				"<%= dir.resources %>/installer/installer.nsi"
		}
	}
};
