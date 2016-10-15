module.exports = {
	options: {
		algorithm: "sha256",
		encoding: "hex",
		dest: "<%= dir.dist %>/<%= package.name %>-v<%= package.version %>-checksums.txt"
	}
};
