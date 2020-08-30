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

		this.localeData = new Map();
		this.translationKeys = new Set();
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

		const output = ( header, callback ) => {
			grunt.log.writeln();
			grunt.log.ok( header );
			const list = callback();
			if ( !list.length ) {
				grunt.log.ok( "Success" );
			} else {
				list.forEach( item => grunt.log.error( item.toString() ) );
			}
		};

		// found translation keys (eg. "foo" or "foo.*.bar")
		const keys = Array.from( translationKeys.values() ).sort();
		// translation keys of default locale
		const main = localeData.get( defaultLocale ).sort();
		localeData.delete( defaultLocale );

		// list of translation keys to be ignored
		const reExclude = exclude.map( str => this._strToRegExp( str ) );
		const fnExclude = ( a, b ) => b.test( a );

		// remove ignored keys from both key lists
		const mainFiltered = diffWith( main, reExclude, fnExclude );
		const keysFiltered = diffWith( keys, reExclude, fnExclude )
			// and turn found keys list into {RegExp[]}
			.map( str => this._strToRegExp( str ) );

		grunt.log.writeln();
		output( "Checking for missing translation keys in locales", () => {
			const missing = [];
			for ( const locale of Array.from( localeData.keys() ).sort() ) {
				const data = localeData.get( locale );
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
		output( "Checking for invalid translation keys in application code", () => {
			return diffWith( keysFiltered, mainFiltered, ( a, b ) => fnExclude( b, a ) );
		});
		output( "Checking for unused translation keys in application code", () => {
			// compare keys of default locale with found keys
			return diffWith( mainFiltered, keysFiltered, fnExclude );
		});
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
		let keys;
		if ( !this.localeData.has( locale ) ) {
			keys = [];
			this.localeData.set( locale, keys );
		} else {
			keys = this.localeData.get( locale );
		}

		const flatten = ( keys, nestedObj, prefix ) => {
			for ( const [ key, value ] of Object.entries( nestedObj ) ) {
				const translationKey = `${prefix}.${key}`;
				const type = typeof value;
				if ( type === "string" ) {
					keys.push( translationKey );
				} else if ( type === "object" && value ) {
					flatten( keys, value, translationKey );
				}
			}
		};
		flatten( keys, content, section );
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

		if (
			// t( "key" )
			   callee.type === "Identifier"
			&& callee.name === "t"

			|| callee.type === "MemberExpression"
			&& callee.property.type === "Identifier"
			&& callee.property.name === "t"
			&& (
				// i18n.t( "key" )
				   callee.object.type === "Identifier"
				&& callee.object.name === "i18n"
				// this.i18n.t( "key" )
				|| callee.object.type === "MemberExpression"
				&& callee.object.object.type === "ThisExpression"
				&& callee.object.property.type === "Identifier"
				&& callee.object.property.name === "i18n"
				// Ember.get( this, "i18n" ).t( "key" )
				|| callee.object.type === "CallExpression"
				&& callee.object.callee.type === "MemberExpression"
				&& callee.object.callee.object.type === "Identifier"
				&& callee.object.callee.object.name === "Ember"
				&& callee.object.callee.property.type === "Identifier"
				&& callee.object.callee.property.name === "get"
				&& callee.object.arguments.length === 2
				&& callee.object.arguments[0].type === "ThisExpression"
				&& callee.object.arguments[1].type === "StringLiteral"
				&& callee.object.arguments[1].value === "i18n"
			)
		) {
			translationKey = args[0].value;
		}

		// pluralization via magic "count" parameter
		// t( "key", { count } )
		// t( "key", { count: value } )
		if (
			   translationKey
			&& args.length === 2
			&& args[1].type === "ObjectExpression"
			&& args[1].properties.some( ({ type, key, computed, method }) =>
				   type === "ObjectProperty"
				&& !computed
				&& !method
				&& key.type === "Identifier"
				&& key.name === "count"
			)
		) {
			translationKey = `${translationKey}.*`;
		}

		if ( translationKey ) {
			this.translationKeys.add( translationKey );
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
			this.translationKeys.add( keyString );
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

		// pluralization via magic "count" parameter
		// {{t "foo" count=value}}
		if (
			   translationKey
			&& hash
			&& hash.type === "Hash"
			&& hash.pairs.some( ({ type, key }) => type === "HashPair" && key === "count" )
		) {
			translationKey = `${translationKey}.*`;
		}

		if ( translationKey ) {
			this.translationKeys.add( translationKey );
		}
	}
};
