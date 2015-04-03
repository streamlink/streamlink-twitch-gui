module.exports = {
	chocolatey: {
		command: "cd "
				+ require( "path" ).join( process.cwd(), "build", "package", "chocolatey" )
				+ " && choco pack -y"
	}
};
