module.exports = {
	chocolatey: {
		command: [
			"cd <%= dir.package %>/chocolatey",
			"choco pack -y"
		].join( " && " )
	}
};
