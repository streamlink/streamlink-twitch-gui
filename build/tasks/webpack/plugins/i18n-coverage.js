// Simply ignore translation strings which include any escaped curly braces.
// This is a cheap workaround since we can't parse the translation format here.
const reTranslationVarsIgnore = /'{/;
const reTranslationVarNames = /{(\w+)(?:}|, )/g;
const reTranslationHTMLTag = /<[a-z-]+[\s>]/;

const paramHTMLSafe = "htmlSafe";


module.exports = class WebpackI18nCoveragePlugin {
	constructor( grunt, { appDir, defaultLocale, localesDir, exclude = [] } = {} ) {
		this.grunt = grunt;
		this.appDir = appDir;
		this.defaultLocale = defaultLocale;
		this.localesDir = localesDir;
		this.exclude = exclude;

		this._BabelParser = require( "@babel/parser" );
		this._BabelTraverse = require( "@babel/traverse" ).default;
		this._Glimmer = require( "@glimmer/syntax" );

		/** @type {Map<string, Map<string, {vars: Set<string>, hasHTMLTags: boolean}>>} */
		this.localeData = new Map();
		/** @type {Map<string, Array<{params: string[], htmlSafe: boolean}>>>} */
		this.translationKeys = new Map();
	}

	apply( compiler ) {
		compiler.hooks.compilation.tap( "i18n-coverage", compilation => {
			// don't emit any files
			compiler.hooks.shouldEmit.tap( "i18n-coverage", () => false );
			// find translation keys in JS and HBS files and get locale data from YML files
			compilation.hooks.succeedModule.tap( "i18n-coverage", this._onModule.bind( this ) );
		});

		compiler.hooks.done.tap( "i18n-coverage", this._onDone.bind( this ) );
	}

	_onDone() {
		const diff = require( "lodash/difference" );
		const diffWith = require( "lodash/differenceWith" );

		const { grunt, localeData, translationKeys, defaultLocale, exclude } = this;

		if ( !localeData.has( defaultLocale ) ) {
			throw new Error( "Missing default locale data" );
		}

		let success = true;
		const output = ( header, fail, callback ) => {
			grunt.log.writeln();
			grunt.log.ok( header );
			const list = callback();
			if ( !list.length ) {
				grunt.log.ok( "Success" );
			} else {
				list.forEach( item => grunt.log.error( item.toString() ) );
				if ( fail ) {
					success = false;
				}
			}
		};

		// found translation keys (eg. "foo" or "foo.*.bar")
		const keys = Array.from( translationKeys.keys() ).sort();
		// translation keys of default locale
		const main = Array.from( localeData.get( defaultLocale ).keys() ).sort();

		// list of translation keys to be ignored
		const reExclude = exclude.map( str => this._strToRegExp( str ) );
		const fnExclude = ( a, b ) => b.test( a );

		// remove ignored keys from both key lists
		const mainFiltered = diffWith( main, reExclude, fnExclude );
		const keysFiltered = diffWith( keys, reExclude, fnExclude )
			// and turn found keys list into {RegExp[]}
			.map( str => this._strToRegExp( str ) );

		grunt.log.writeln();
		output( "Checking for missing translation keys in locales", false, () => {
			const missing = [];
			for ( const locale of Array.from( localeData.keys() ).sort() ) {
				if ( locale === defaultLocale ) { continue; }
				const data = Array.from( localeData.get( locale ).keys() );
				// remove ignored keys from current locale's data
				const dataFiltered = diffWith( data.sort(), reExclude, fnExclude );
				// compare with default locale and add diff to missing list
				missing.push(
					...diff( mainFiltered, dataFiltered )
						.map( item => `${locale}: ${item}` )
				);
			}
			return missing;
		});
		output( "Checking for invalid translation keys in application code", false, () => {
			return diffWith( keysFiltered, mainFiltered, ( a, b ) => fnExclude( b, a ) );
		});
		output( "Checking for unused translation keys in application code", false, () => {
			// compare keys of default locale with found keys
			return diffWith( mainFiltered, keysFiltered, fnExclude );
		});
		output( "Checking for missing/invalid translation variables", true, () => {
			const errors = [];
			const defaultLocaleData = localeData.get( defaultLocale );
			for ( const [ locale, data ] of localeData.entries() ) {
				if ( locale === defaultLocale ) { continue; }
				for ( const [ key, { vars } ] of data.entries() ) {
					if ( !defaultLocaleData.has( key ) ) { continue; }
					const { vars: defaultLocaleKeyVars } = defaultLocaleData.get( key );
					for ( const variable of defaultLocaleKeyVars ) {
						if ( !vars.has( variable ) ) {
							errors.push( `Missing variable in ${locale}.${key}: ${variable}` );
						}
					}
					for ( const variable of vars ) {
						if ( !defaultLocaleKeyVars.has( variable ) ) {
							errors.push( `Invalid variable in ${locale}.${key}: ${variable}` );
						}
					}
				}
			}
			return errors;
		});
		output( "Checking for missing/invalid translation parameters", true, () => {
			const errors = [];
			const defaultLocaleData = localeData.get( defaultLocale );
			for ( const key of keys ) {
				if ( key.includes( "*" ) || !defaultLocaleData.has( key ) ) { continue; }
				const { vars, hasHTMLTags } = defaultLocaleData.get( key );
				for ( const { params, htmlSafe } of translationKeys.get( key ) ) {
					if ( hasHTMLTags && !htmlSafe ) {
						errors.push( `Missing ${paramHTMLSafe} parameter in ${key}` );
					}
					for ( const variable of vars ) {
						// eslint-disable-next-line max-depth
						if ( !params.length || !params.includes( variable ) ) {
							errors.push( `Missing parameter in ${key}: ${variable}` );
						}
					}
					for ( const param of params ) {
						// eslint-disable-next-line max-depth
						if ( !vars.has( param ) ) {
							errors.push( `Invalid parameter in ${key}: ${param}` );
						}
					}
				}
			}
			return errors;
		});

		if ( !success ) {
			grunt.fail.fatal();
		}
	}

	_onModule( module ) {
		if ( !module.resource || !module.resource.startsWith( this.appDir ) ) {
			return;
		}

		// get built module content
		const content = module.originalSource().source();

		if ( module.resource.startsWith( this.localesDir ) ) {
			const match = /[\/\\]([\w-]+)[\/\\]([\w-]+)\.yml$/.exec( module.resource );
			if ( !match ) { return; }
			const [ , locale, section ] = match;
			this._addLocaleData( locale, section, this._getContent( content ) );

		} else if ( module.resource.endsWith( ".js" ) ) {
			// let Babel parse it again
			this._parseJavaScript( content );

		} else if ( module.resource.endsWith( ".hbs" ) ) {
			// get content from the raw-loader's output and let Glimmer parse it
			this._parseHTMLBars( this._getContent( content ) );
		}
	}

	_getContent( content ) {
		content = content.replace( /^module\.exports\s*=\s*|;$/g, "" );
		// get data of the optimized-json-loader
		if ( content.startsWith( "JSON.parse(" ) ) {
			content = JSON.parse( content.replace( /^JSON\.parse\(|\)$/g, "" ) );
		}

		return JSON.parse( content );
	}

	_addLocaleData( locale, section, content ) {
		let translations;
		if ( !this.localeData.has( locale ) ) {
			translations = new Map();
			this.localeData.set( locale, translations );
		} else {
			translations = this.localeData.get( locale );
		}

		const flatten = ( translations, nestedObj, prefix ) => {
			for ( const [ key, value ] of Object.entries( nestedObj ) ) {
				const translationKey = `${prefix}.${key}`;
				const type = typeof value;
				if ( type === "string" ) {
					const hasHTMLTags = reTranslationHTMLTag.test( value );
					const vars = new Set();
					if ( !reTranslationVarsIgnore.test( value ) ) {
						for ( const [, name ] of value.matchAll( reTranslationVarNames ) ) {
							vars.add( name );
						}
					}
					translations.set( translationKey, { vars, hasHTMLTags } );

				} else if ( type === "object" && value ) {
					flatten( translations, value, translationKey );
				}
			}
		};
		flatten( translations, content, section );
	}

	_strToRegExp( str ) {
		const reStr = str
			.replace( /[\\.]/g, "\\$&" )
			.replace( /\*/g, "[\\w-]+" );
		const regexp = new RegExp( `^${reStr}$` );
		regexp.toString = () => str;

		return regexp;
	}

	_parseJavaScript( content ) {
		const ast = this._BabelParser.parse( content, {
			sourceType: "module"
		});
		this._BabelTraverse( ast, {
			CallExpression: this._babelCallExpression.bind( this ),
			TaggedTemplateExpression: this._babelTaggedTemplateExpression.bind( this )
		});
	}

	_parseHTMLBars( content ) {
		const ast = this._Glimmer.preprocess( content );
		this._Glimmer.traverse( ast, {
			MustacheStatement: this._glimmerTraverseCallback.bind( this ),
			SubExpression: this._glimmerTraverseCallback.bind( this )
		});
	}

	_babelCallExpression({ node }) {
		const { callee, arguments: args } = node;
		if ( args.length === 0 || args[0].type !== "StringLiteral" ) { return; }

		let translationKey;
		let translationParams;

		if (
			// t( "key", params )
			   callee.type === "Identifier"
			&& callee.name === "t"

			|| callee.type === "MemberExpression"
			&& callee.property.type === "Identifier"
			&& callee.property.name === "t"
			&& (
				// intl.t( "key", params )
				   callee.object.type === "Identifier"
				&& callee.object.name === "intl"
				// this.intl.t( "key", params )
				|| callee.object.type === "MemberExpression"
				&& callee.object.object.type === "ThisExpression"
				&& callee.object.property.type === "Identifier"
				&& callee.object.property.name === "intl"
				// Ember.get( this, "intl" ).t( "key", params )
				|| callee.object.type === "CallExpression"
				&& callee.object.callee.type === "MemberExpression"
				&& callee.object.callee.object.type === "Identifier"
				&& callee.object.callee.object.name === "Ember"
				&& callee.object.callee.property.type === "Identifier"
				&& callee.object.callee.property.name === "get"
				&& callee.object.arguments.length === 2
				&& callee.object.arguments[0].type === "ThisExpression"
				&& callee.object.arguments[1].type === "StringLiteral"
				&& callee.object.arguments[1].value === "intl"
			)
		) {
			translationKey = args[0].value;

			if ( args.length === 2 && args[1].type === "ObjectExpression" ) {
				translationParams = [];
				for ( const prop of args[1].properties ) {
					if ( prop.type === "ObjectProperty" ) {
						translationParams.push( prop.key.name );
					}
				}
			}
		}

		if ( translationKey ) {
			this._addTranslationCall( translationKey, translationParams );
		}
	}

	_babelTaggedTemplateExpression({ node }) {
		const { tag, quasi: { type, quasis } } = node;
		if (
			// t`foo.${bar}.baz`
			   tag.type === "Identifier"
			&& tag.name === "t"
			&& type === "TemplateLiteral"
			&& quasis.length > 0
		) {
			const keyString = quasis
				.slice( 1 )
				.reduce( ( arr, elem ) => {
					arr.push( "*", elem.value.cooked );
					return arr;
				}, [ quasis[0].value.cooked ] )
				.join( "" );
			this._addTranslationCall( keyString );
		}
	}

	_glimmerTraverseCallback({ path, params, hash }) {
		if (
			   path.type !== "PathExpression"
			|| path.original !== "t"
			|| params.length === 0
		) {
			return;
		}

		const [ firstParam ] = params;
		let translationKey;

		if (
			// {{t "key"}}
			firstParam.type === "StringLiteral"
		) {
			translationKey = firstParam.value;

		} else if (
			// {{t (concat "foo" bar "baz" qux "quux")}}
			   firstParam.type === "SubExpression"
			&& firstParam.path.type === "PathExpression"
			&& firstParam.path.original === "concat"
			&& firstParam.params.length > 0
			&& firstParam.params[0].type === "StringLiteral"
		) {
			translationKey = firstParam.params
				.map( param => param.type === "StringLiteral" ? param.original : "*" )
				.join( "" );
		}

		if ( translationKey ) {
			let translationParams = [];
			let htmlSafe = false;
			for ( const pair of hash.pairs ) {
				if ( pair.type === "HashPair" ) {
					if ( pair.key === paramHTMLSafe ) {
						let { value } = pair;
						htmlSafe = value && value.type === "BooleanLiteral" && !!value.value;
					} else {
						translationParams.push( pair.key );
					}
				}
			}

			this._addTranslationCall( translationKey, translationParams, htmlSafe );
		}
	}

	_addTranslationCall( key, params, htmlSafe = false ) {
		let arr = this.translationKeys.get( key );
		if ( !arr ) {
			arr = [];
			this.translationKeys.set( key, arr );
		}
		params = params || [];
		arr.push({ params, htmlSafe });
	}
};
