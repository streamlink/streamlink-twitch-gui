// not a real task, just a config that gets referenced in other tasks
// see the dist and shell task configs
module.exports = {
	linux32: {
		image: "ghcr.io/streamlink/appimage-buildenv-i686",
		digest: "sha256:6d9218d0a2b7d755d9b54a9f8f58e6fe144f60c2961553896d7af1d7c9f3bb47",
		input: "<%= dir.releases %>/<%= package.name %>/linux32",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-i686.AppImage",
		dependencies: [
			"0:libatomic-4.8.5-44.el7.i686=/usr/lib/libatomic.so.1"
		]
	},
	linux64: {
		image: "ghcr.io/streamlink/appimage-buildenv-x86_64",
		digest: "sha256:2f08ec73b4d593f365a14f3e0844beb16b334f1db42ca7c05e7a8095929d81db",
		input: "<%= dir.releases %>/<%= package.name %>/linux64",
		output: "<%= dir.dist %>/<%= package.name %>-<%= version %>-x86_64.AppImage",
		dependencies: [
			"0:libatomic-4.8.5-44.el7.x86_64=/usr/lib64/libatomic.so.1"
		]
	}
};
