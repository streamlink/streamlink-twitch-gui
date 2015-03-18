module.exports = {
	all: {
		dependencies: {
			"bower.json"  : [ "dependencies" ],
			"package.json": [ "dependencies", "devDependencies" ]
		},
		contributors: {
			minCommits: 3
		},
		dest: "src/metadata.json"
	}
};
