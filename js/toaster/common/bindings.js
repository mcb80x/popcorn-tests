(function() {
  var hideElement, root, showElement, svgbind;

  hideElement = function(el) {
    return el.attr('opacity', 0.0);
  };

  showElement = function(el) {
    return el.attr('opacity', 1.0);
  };

  ko.bindingHandlers.slider = {
    init: function(element, valueAccessor, allBindingsAccessor) {
      var options;
      options = allBindingsAccessor().sliderOptions || {};
      $(element).slider(options);
      ko.utils.registerEventHandler(element, 'slidechange', function(event, ui) {
        var observable;
        observable = valueAccessor();
        return observable(ui.value);
      });
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        return $(element).slider('destroy');
      });
      return ko.utils.registerEventHandler(element, 'slide', function(event, ui) {
        var observable;
        observable = valueAccessor();
        return observable(ui.value);
      });
    },
    update: function(element, valueAccessor) {
      var value;
      value = ko.utils.unwrapObservable(valueAccessor());
      if (isNaN(value)) {
        value = 0;
      }
      return $(element).slider('value', value);
    }
  };

  this.manualOutputBindings = [];

  svgbind = {
    bindVisible: function(selector, observable) {
      var el, setter, thisobj;
      el = d3.select(selector);
      thisobj = this;
      setter = function(newVal) {
        if (newVal) {
          return showElement(el);
        } else {
          return hideElement(el);
        }
      };
      observable.subscribe(setter);
      return setter(observable());
    },
    bindAttr: function(selector, attr, observable, mapping) {
      var el, setter;
      el = d3.select(selector);
      console.log(el);
      setter = function(newVal) {
        return el.attr(attr, mapping(newVal));
      };
      observable.subscribe(setter);
      return setter(observable());
    },
    bindMultiState: function(selectorMap, observable) {
      var elements, k, keys, s, setter, values;
      keys = Object.keys(selectorMap);
      values = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          k = keys[_i];
          _results.push(selectorMap[k]);
        }
        return _results;
      })();
      elements = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          s = keys[_i];
          _results.push(d3.select(s));
        }
        return _results;
      })();
      setter = function(val) {
        var el, i, matchElements, matchSelectors, _i, _j, _len, _len1, _results;
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
          el = elements[_i];
          hideElement(el);
        }
        matchSelectors = (function() {
          var _j, _ref, _results;
          _results = [];
          for (i = _j = 0, _ref = keys.length; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
            if (values[i] === val) {
              _results.push(keys[i]);
            }
          }
          return _results;
        })();
        matchElements = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = matchSelectors.length; _j < _len1; _j++) {
            s = matchSelectors[_j];
            _results.push(d3.select(s));
          }
          return _results;
        })();
        _results = [];
        for (_j = 0, _len1 = matchElements.length; _j < _len1; _j++) {
          el = matchElements[_j];
          _results.push(showElement(el));
        }
        return _results;
      };
      observable.subscribe(setter);
      return setter(observable());
    }
  };

  root = typeof window !== "undefined" && window !== null ? window : exports;

  root.svgbind = svgbind;

}).call(this);
