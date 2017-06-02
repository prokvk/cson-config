(function() {
  var cson, fs, mapRecursive, path, stack, substitutes,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  cson = require('./lib/cson');

  path = require('path');

  fs = require('fs');

  stack = [];

  substitutes = [];

  exports.use = function(regexp, callback) {
    return stack.push({
      regexp: regexp,
      handle: callback
    });
  };

  exports.load = function(configPath, exportToProcess) {
    var base, c, configDir, ef, env, err, error, i, item, items, j, key, len, len1, name, s, val, value;
    if (exportToProcess == null) {
      exportToProcess = true;
    }
    if (!configPath) {
      configDir = path.dirname(module.parent.filename);
      configPath = configDir + "/config.cson";
    } else {
      configDir = path.dirname(configPath);
    }
    try {
      ef = configDir + "/.env";
      items = fs.readFileSync(ef).toString().split("\n");
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        s = item.match(/^([A-Z0-9_-]+)=(.+)/);
        if (!s) {
          continue;
        }
        env = s[2].match(/\$[A-Z0-9_-]+/g) || [];
        for (j = 0, len1 = env.length; j < len1; j++) {
          key = env[j];
          if (value = process.env[key.slice(1)]) {
            s[2] = s[2].replace(key, value);
          }
        }
        if ((base = process.env)[name = s[1]] == null) {
          base[name] = s[2];
        }
      }
    } catch (error) {
      err = error;
    }
    c = cson.parseFileSync(configPath, {
      sandbox: global
    });
    if (stack.length > 0) {
      mapRecursive(c, function(val) {
        var filter, k, len2, substitute;
        for (k = 0, len2 = stack.length; k < len2; k++) {
          filter = stack[k];
          if (filter.regexp.test(val)) {
            substitute = filter.handle(val);
            if (indexOf.call(substitutes, substitute) < 0) {
              substitutes.push(substitute);
            }
            return substitute;
          }
        }
        return val;
      });
    }
    if (c instanceof Error) {
      console.log("Error in config file " + configPath);
      console.log(c);
      process.exit(1);
    }
    if (exportToProcess) {
      for (key in c) {
        val = c[key];
        process.config[key] = val;
      }
    }
    return c;
  };

  mapRecursive = function(obj, callback) {
    var key, ref, results, val;
    if (typeof obj !== "object") {
      return;
    }
    results = [];
    for (key in obj) {
      if (ref = obj[key], indexOf.call(substitutes, ref) >= 0) {
        continue;
      }
      if (typeof obj[key] === "object") {
        results.push(mapRecursive(obj[key], callback));
      } else {
        val = callback(obj[key]);
        if (val) {
          results.push(obj[key] = val);
        } else {
          results.push(void 0);
        }
      }
    }
    return results;
  };

}).call(this);
