# Passport-LINE (passport-line)

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [LINE](http://line.me/) using the OAuth 2.0 API. (Updated to support LINE Login v2.1)

This module lets you authenticate using LINE in your Node.js applications.
By plugging into Passport, LINE authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-line

## Usage

#### Configure Strategy

The LINE authentication strategy authenticates users using a LINE
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a channelID, channelSecret, and callback URL.

    passport.use(new LineStrategy({
        channelID: YOUR LINE CHANNEL ID,
        channelSecret: YOUR LINE CHANNEL SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/line/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ id: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));


#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'line'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/line',
      passport.authenticate('line'));

    app.get('/auth/line/callback', 
      passport.authenticate('line', { failureRedirect: '/login', successRedirect : '/' }));

## Examples

For a complete, working example, refer to the [login example](https://github.com/jaredhanson/passport-line/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/nitzo/passport-line.png)](http://travis-ci.org/nitzo/passport-line)

## Credits

  - [Nitzan Bar](http://github.com/nitzo)
  - [Kazuki MATSUDA / 松田一樹](https://github.com/kazuki-ma) (Add LINE login v2.1 support)
  
  
  Special thanks to [Jared Hanson](http://github.com/jaredhanson)!

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015-2018 [Nitzan Bar](http://github.com/nitzo)
 
