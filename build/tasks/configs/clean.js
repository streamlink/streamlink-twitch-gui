module.exports = {
	options        : { force: true },
	tmp            : [ "build/tmp/**", "!build/tmp" ],
	release_win    : [ "build/releases/<%= package.name %>/win/**" ],
	release_osx    : [ "build/releases/<%= package.name %>/osx/**" ],
	release_linux32: [ "build/releases/<%= package.name %>/linux32/**" ],
	release_linux64: [ "build/releases/<%= package.name %>/linux64/**" ]
};
