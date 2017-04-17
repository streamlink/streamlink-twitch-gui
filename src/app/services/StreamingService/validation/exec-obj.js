export default class ExecObj {
	/**
	 * @param {String?} exec
	 * @param {String?} pythonscript
	 * @param {Object<String,String>?} env
	 */
	constructor( exec = null, pythonscript = null, env = null ) {
		this.exec = exec;
		this.pythonscript = pythonscript;
		this.env = env;
	}
}
