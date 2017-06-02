(function() {
  var assert, localConfig, util;

  assert = require('assert');

  util = require('util');

  require('../').load();

  assert(process.config.mongo === 'mmmm', "mongo isnt mmmm");

  localConfig = require('../').load('./test/config2.cson', false);

  assert(localConfig.url === 'mmmm', "local url isnt mmmm");

  assert(process.config.url === void 0, "global url isnt undefined");

  localConfig = require('../').load('./test/emptyConfig.cson', false);

  assert(typeof localConfig === 'object');

  assert(Object.keys(localConfig).length === 0);

}).call(this);
