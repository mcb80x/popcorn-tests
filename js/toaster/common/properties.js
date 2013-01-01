(function() {

  common.PropsEnabled = (function() {

    function PropsEnabled() {}

    PropsEnabled.prototype.prop = function(defaultVal, cb) {
      var f, obs, owner;
      owner = this;
      obs = ko.observable(defaultVal);
      if (cb != null) {
        obs.subscribe(cb);
      }
      obs.bindVisisble = function(sel) {
        return bindVisisble;
      };
      f = function(newVal) {
        if (newVal != null) {
          if (newVal.subscribe != null) {
            obs = newVal;
            if (cb != null) {
              obs.subscribe(cb);
            }
          } else {
            obs(newVal);
          }
          return owner;
        } else {
          return obs();
        }
      };
      f.observable = obs;
      f.subscribe = function(f2) {
        return obs.subscribe(f2);
      };
      return f;
    };

    PropsEnabled.prototype.defineProps = function(names, defaultVal) {
      var name, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = names.length; _i < _len; _i++) {
        name = names[_i];
        _results.push(this[name] = this.prop(defaultVal));
      }
      return _results;
    };

    return PropsEnabled;

  })();

  common.ViewModel = (function() {

    function ViewModel() {}

    ViewModel.prototype.inheritProperties = function(target, keys) {
      var k, targetVal, _i, _len, _results;
      if (!$.isArray(keys)) {
        keys = [keys];
      }
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        k = keys[_i];
        targetVal = target[k];
        if (!$.isFunction(targetVal)) {
          throw "Unsupported parameter to inherit: " + k;
        }
        if (targetVal.observable != null) {
          _results.push(this[k] = targetVal.observable);
        } else {
          console.log('here');
          _results.push(this[k] = ko.computed({
            read: function() {
              return targetVal();
            },
            write: function(newVal) {
              return targetVal(newVal);
            }
          }));
        }
      }
      return _results;
    };

    return ViewModel;

  })();

}).call(this);
