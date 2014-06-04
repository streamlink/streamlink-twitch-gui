module.exports = {
	options			: { force: true },
	dev				: [ "build/tmp/**", "!build/tmp" ],
	release			: [ "build/{tmp,releases}/**", "!build/{tmp,releases}" ]
};
