define( [ "ember" ], function( Ember ) {

	/*
	 * Using a custom implementation for comparing semantic version strings
	 * - "semver" npm-module too much (would also need to change the build process for node modules)
	 * - no reliable bower-modules for this
	 *
	 * TODO: refactor comparison functions (and also stuff of other controllers) and add unit tests
	 */

	var	reSemVer	= /^\s*v?(\d+\.\d+\.\d+)(?:-([a-z\d\.]+))?(?:\+([a-z\d\.]+))?\s*$/i,
		reNumbers	= /\d+|\D+/g;

	function castToNumber( val ) {
		var num = Number( val );
		return isNaN( num ) ? val : num;
	}

	/**
	 * Split a matching semantic version string into a nested array of tokens
	 * @param {string} value
	 * @returns {Array|undefined}
	 */
	function tokenizeVersion( value ) {
		var m = String( value ).match( reSemVer );
		if ( !m ) { return undefined; }
		return [
			m[1].split( "." ).map( castToNumber ),
			m[2] ? m[2].match( reNumbers ).map( castToNumber ) : undefined
			// semver.org: "Build metadata SHOULD be ignored when determining version precedence"
			//m[3] ? m[3].match( reNumbers ).map( castToNumber ) : undefined
		];
	}

	/**
	 * Compare function (Array.prototype.sort) for tokenized versions
	 * X-alpha < X-alpha.1 < X-alpha.beta < X-beta < X-beta.2 < X-beta.11 < X-rc.1 < X
	 *
	 * @param {Array} left
	 * @param {Array} right
	 * @returns {number}
	 */
	function compareVersions( left, right ) {
		var	lA = !(  left instanceof Array ),
			rA = !( right instanceof Array );

		// only compare two arrays!!!
		if ( lA && rA ) { return 0; }
		if ( lA ) { return -1; }
		if ( rA ) { return  1; }

		// compare each element
		for ( var l, r, sub, nL = left.length, nR = right.length, i = 0; i < nL && i < nR; i++ ) {
			l = left[ i ];
			r = right[ i ];

			// does a token contain another list of subtokens?
			lA = l instanceof Array;
			rA = r instanceof Array;
			if ( lA || rA ) {
				if ( !lA ) { return  1; }
				if ( !rA ) { return -1; }
				// compare subtokenlist
				sub = compareVersions( l, r );
				// go on if both subtokenlists are equal
				if ( sub !== 0 ) { return sub; }

			// compare flag values
			} else {
				// invalid or missing value comparison
				if ( l === undefined && r === undefined ) { return 0; }
				if ( l === undefined ) { return  1; }
				if ( r === undefined ) { return -1; }

				// compare values regularly
				if ( l > r ) { return  1; }
				if ( l < r ) { return -1; }
			}
		}
		// both equal to this point... compare remaining length
		return nL - nR;
	}

	/**
	 * Return the highest version
	 * @param {Object[]} versions - An array of version records
	 * @param {Function} traverse - Get the version string out of the record
	 * @returns {Object} the record with the highest version string
	 */
	function maxVersion( versions, traverse ) {
		// tokenize once and save original value
		return versions.map(function( version ) {
			return {
				token: tokenizeVersion( traverse( version ) ),
				value: version
			};
		// then return the original value of the maximum
		}).reduce(function( max, current ) {
			return compareVersions( max.token, current.token ) === 1
				? max
				: current;
		}).value;
	}


	return Ember.ObjectController.extend({
		needs: [ "modal" ],

		// check again in 3 days (time in ms)
		time: 1000 * 3600 * 24 * 3,


		check: function( ApplicationModel ) {
			var version = Ember.get( ApplicationModel, "package.version" );
			if ( !version ) { return; }

			// Load Versioncheck record
			this.store.find( "versioncheck" ).then(function( records ) {
				var content = records.toArray();
				if ( !content.length || Ember.get( content, "0.checkagain" ) <= +new Date() ) {
					// let's check for a new release
					this.checkReleases( version );
				}
			}.bind( this ) );
		},

		checkReleases: function( version ) {
			function getVers( record ) {
				return Ember.get( record, "tag_name" );
			}

			this.store.find( "githubReleases" ).then(function( releases ) {
				// filter records first
				return releases.toArray().filter(function( release ) {
					// ignore drafts
					return !release.get( "draft" );
				});
			}).then(function( releases ) {
				var	modal	= this.get( "controllers.modal" ),

				// create a fake record for the current version and save a reference
					current	= { tag_name: "v" + version },
				// find out the maximum of fetched releases
					maximum	= maxVersion( releases, getVers ),
				// and compare it with the current version
					latest	= maxVersion( [ current, maximum ], getVers );

				// no new release? check again in a few days
				if ( latest === current || getVers( current ) === getVers( maximum ) ) {
					return this.releaseIgnore();
				}

				// ask the user what to do
				this.send( "openModal",
					"You're using an outdated version: " + getVers( current ),
					"Do you want to download the latest release now? (" + getVers( maximum ) + ")",
					[
						new modal.Button(
							"Download", "btn-success", "fa-download",
							this.releaseDownload.bind( this, Ember.get( latest, "html_url" ) )
						),
						new modal.Button(
							"Ignore", "btn-danger", "fa-times",
							this.releaseIgnore.bind( this )
						)
					]
				);
			}.bind( this ) );
		},

		releaseDownload: function( url ) {
			this.send( "open_browser", url );
			this.releaseIgnore();
		},

		releaseIgnore: function() {
			this.store.find( "versioncheck" ).then(function( record ) {
				if ( record = record.content[0] ) {
					record.set( "checkagain", +new Date() + this.time );
					record.save();
				} else {
					this.store.createRecord( "versioncheck", {
						id: 1,
						checkagain: +new Date() + this.time
					}).save();
				}
			}.bind( this ) );
		}
	});

});
