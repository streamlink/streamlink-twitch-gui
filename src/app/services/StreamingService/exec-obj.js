export default class ExecObj {
	/**
	 * @param {String?} exec
	 * @param {String[]?} params
	 * @param {Object<String,String>?} env
	 */
	constructor( exec = null, params = null, env = null ) {
		this.exec = exec;
		this.params = params;
		this.env = env;
	}

	/**
	 * @param {ExecObj} execObj
	 */
	merge( execObj ) {
		if ( execObj.exec ) {
			this.exec = execObj.exec;
		}
		if ( execObj.params ) {
			this.params = execObj.params;
		}
		if ( execObj.env ) {
			this.env = execObj.env;
		}
	}
}
