module.exports = {
	options: { force: true },

	dist: [
		"<%= dir.dist %>/**",
		"!<%= dir.dist %>"
	],

	tmp: [
		"<%= dir.tmp %>/**",
		"!<%= dir.tmp %>",
		"!<%= dir.tmp_dev %>",
		"!<%= dir.tmp_prod %>",
		"!<%= dir.tmp_test %>"
	],
	tmp_dev: [
		"<%= dir.tmp_dev %>/**",
		"!<%= dir.tmp_dev %>"
	],
	tmp_prod: [
		"<%= dir.tmp_prod %>/**",
		"!<%= dir.tmp_prod %>"
	],
	tmp_test: [
		"<%= dir.tmp_test %>/**",
		"!<%= dir.tmp_test %>"
	],

	cache: [
		"<%= dir.cache %>/**",
		"!<%= dir.cache %>"
	],

	releases: [
		"<%= dir.releases %>/**",
		"!<%= dir.releases %>"
	],
	release_win32: [ "<%= dir.releases %>/<%= package.name %>/win32/**" ],
	release_win64: [ "<%= dir.releases %>/<%= package.name %>/win64/**" ],
	release_osx64: [ "<%= dir.releases %>/<%= package.name %>/osx64/**" ],
	release_linux32: [ "<%= dir.releases %>/<%= package.name %>/linux32/**" ],
	release_linux64: [ "<%= dir.releases %>/<%= package.name %>/linux64/**" ],

	package_chocolatey: [ "<%= dir.package %>/chocolatey/**" ],
	package_win32installer: [ "<%= dir.package %>/win32installer/**" ],
	package_win64installer: [ "<%= dir.package %>/win64installer/**" ]
};
