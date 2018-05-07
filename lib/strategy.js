/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The LINE authentication strategy authenticates requests by delegating to
 * LINE using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `channelID`      your LINE channel's id
 *   - `clientSecret`   your LINE channel's secret
 *   - `callbackURL`   URL to which LINE will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new LineStrategy({
 *         channelID: 'XXX',
 *         clientSecret: 'XXXX'
 *         callbackURL: 'https://www.example.net/auth/line/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (options.state === false) {
    throw new Error('options.state === false is not supported since LINE Login v2');
  }

  options = options || {};

  // Default options.state to true (Now required by LINE v2)
  // passport-oauth handles this and generates a unique state identification for the request
  // This identification is then saved in Session (by default) and compared when response arrives
  // NOTE: that now this requires you to use express-session (or a similar) session plugin
  // Optionally you can use your own state store. See passport-oauth2 for more information.
  options.state = options.state || true;

  options.clientID = options.channelID;
  options.clientSecret = options.channelSecret;
  options.authorizationURL = options.authorizationURL || 'https://access.line.me/oauth2/v2.1/authorize';
  options.tokenURL = options.tokenURL || 'https://api.line.me/oauth2/v2.1/token';

  if (!options.scope) {
    options.scope = 'profile';
  }

  OAuth2Strategy.call(this, options, verify);

  this.name = 'line';

  // Use Authorization Header (Bearer with Access Token) for GET requests. Used to get User's profile.
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from LINE.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `line`
 *   - `id`               the user's LINE ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  this._oauth2.get('https://api.line.me/v2/profile', accessToken, function (err, body, res) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }
    
    try {
      var json = JSON.parse(body);
      
      var profile = { provider: 'line' };
      profile.id = json.userId;
      profile.displayName = json.displayName;

      if (json.pictureUrl) {
        profile.pictureUrl = json.pictureUrl;
      }

      if (json.statusMessage) {
        profile.statusMessage = json.statusMessage;
      }

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
