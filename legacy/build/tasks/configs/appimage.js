// not a real task, just a config that gets referenced in other tasks
// see the dist and shell task configs
module.exports = {
	linux32: {
		image: "ghcr.io/streamlink/appimage-buildenv-i686",
		digest: "sha256:c4ad9e44c413e8dd5e7746541e30b0b5a045a31fb3a2d09fcca6e3dcf4ef66b2",
		input: "<%= dir.releases %>/<%= package.name %>/linux32",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-i686.AppImage",
		dependencies: [
			"0:libatomic-4.8.5-44.el7.i686=/usr/lib/libatomic.so.1"
		]
	},
	linux64: {
		image: "ghcr.io/streamlink/appimage-buildenv-x86_64",
		digest: "sha256:ef8a305ec5b35258c3025ac029693dd3e6a822f4983354eb8c2243e48d1ebc2e",
		input: "<%= dir.releases %>/<%= package.name %>/linux64",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-x86_64.AppImage",
		dependencies: [
			"0:libatomic-4.8.5-44.el7.x86_64=/usr/lib64/libatomic.so.1"
		]
	}
};
