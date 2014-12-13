module.exports = {
	options        : { force: true },
	dist           : [ "dist/**", "!dist" ],
	tmp            : [ "build/tmp/**", "!build/tmp" ],
	cache          : [ "build/cache/**", "!build/cache" ],
	releases       : [ "build/releases/**", "!build/releases" ],
	release_win32  : [ "build/releases/<%= package.name %>/win32/**" ],
	release_win64  : [ "build/releases/<%= package.name %>/win64/**" ],
	release_osx32  : [ "build/releases/<%= package.name %>/osx32/**" ],
	release_osx64  : [ "build/releases/<%= package.name %>/osx64/**" ],
	release_linux32: [ "build/releases/<%= package.name %>/linux32/**" ],
	release_linux64: [ "build/releases/<%= package.name %>/linux64/**" ]
};
