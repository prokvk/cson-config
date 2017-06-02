(function() {
  var CSON, coffee, fsUtil, pathUtil, wait;

  coffee = require('coffee-script');

  fsUtil = require('fs');

  pathUtil = require('path');

  wait = function(delay, fn) {
    return setTimeout(fn, delay);
  };

  CSON = {
    parseFile: function(filePath, opts, next) {
      var err, error, result;
      if ((opts != null) === true && (next != null) === false) {
        next = opts;
        opts = null;
      }
      opts || (opts = {});
      filePath = pathUtil.resolve(filePath);
      if (/\.(js|coffee)$/.test(filePath)) {
        try {
          delete require.cache[filePath];
          result = require(filePath);
          delete require.cache[filePath];
        } catch (error) {
          err = error;
          return next(err, result);
        } finally {
          return next(null, result);
        }
      } else if (/\.(json|cson)$/.test(filePath)) {
        fsUtil.readFile(filePath, (function(_this) {
          return function(err, data) {
            var dataStr;
            if (err) {
              return next(err);
            }
            dataStr = data.toString();
            return _this.parse(dataStr, opts, next);
          };
        })(this));
      } else {
        err = new Error("CSON.parseFile: Unknown extension type for " + filePath);
        next(err);
      }
      return this;
    },
    parseFileSync: function(filePath, opts) {
      var data, dataStr, err, error, result;
      opts || (opts = {});
      filePath = pathUtil.resolve(filePath);
      if (/\.(js|coffee)$/.test(filePath)) {
        try {
          delete require.cache[filePath];
          result = require(filePath);
          delete require.cache[filePath];
          return result;
        } catch (error) {
          err = error;
          return err;
        }
      } else if (/\.(json|cson)$/.test(filePath)) {
        data = fsUtil.readFileSync(filePath);
        if (data instanceof Error) {
          result = data;
        } else {
          dataStr = data.toString();
          result = this.parseSync(dataStr, opts);
        }
        return result;
      } else {
        err = new Error("CSON.parseFileSync: Unknown extension type for " + filePath);
        return err;
      }
    },
    parse: function(src, opts, next) {
      if ((opts != null) === true && (next != null) === false) {
        next = opts;
        opts = null;
      }
      opts || (opts = {});
      wait(0, (function(_this) {
        return function() {
          var result;
          result = _this.parseSync(src, opts);
          if (result instanceof Error) {
            return next(result);
          } else {
            return next(null, result);
          }
        };
      })(this));
      return this;
    },
    parseSync: function(src, opts) {
      var err, error, error1, result;
      opts || (opts = {});
      if (opts.sandbox == null) {
        opts.sandbox = true;
      }
      try {
        result = JSON.parse(src);
      } catch (error) {
        err = error;
        try {
          result = coffee["eval"](src, opts);
          if (result == null) {
            result = {};
          }
        } catch (error1) {
          err = error1;
          result = err;
        }
      }
      return result;
    }
  };

  module.exports = CSON;

}).call(this);
