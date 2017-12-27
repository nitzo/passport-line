var vows = require('vows');
var assert = require('assert');
var util = require('util');
var LineStrategy = require('../lib/strategy');


vows.describe('LineStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new LineStrategy({
        channelID: 'ABC123',
        channelSecret: 'secret'
      },
      function() {});
    },
    
    'should be named line': function (strategy) {
      assert.equal(strategy.name, 'line');
    },
    'should rejected options.state === false': function() {
      assert.throws(function () {
        new LineStrategy({
          channelID: 'ABC123',
          channelSecret: 'secret',
          state: false
        },
        function () {});
      }, Error);
    }
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new LineStrategy({
        channelID: 'ABC123',
        channelSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{"displayName":"Snoop Doggy Dogg","userId":"123456","pictureUrl":""}';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'line');
        assert.equal(profile.id, '123456');
        assert.equal(profile.displayName, 'Snoop Doggy Dogg');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new LineStrategy({
        channelID: 'ABC123',
        channelSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);
