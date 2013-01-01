(function() {
  var oscilloscope, root;

  oscilloscope = function(svgSelector, frameSelector) {
    var addProperty, base, dataBuffer, dataFn, dataXOffset, frame, height, line, margin, maxX, maxY, minX, minY, name, path, plot, proxy, setScales, svg, width, xScale, yScale, _i, _j, _len, _len1, _ref, _ref1;
    svg = d3.select(svgSelector);
    frame = d3.select(frameSelector);
    dataBuffer = [];
    minX = 0.0;
    maxX = 10.0;
    minY = -90.0;
    maxY = 50;
    dataXOffset = 0.0;
    margin = {
      top: 5.0,
      right: 5.0,
      bottom: 5.0,
      left: 5.0
    };
    xScale = void 0;
    yScale = void 0;
    width = 0;
    height = 0;
    frame.attr('opacity', 0.0);
    setScales = function() {
      var frameXOffset, frameYOffset;
      frameXOffset = Number(frame.attr('x'));
      frameYOffset = Number(frame.attr('y'));
      width = Number(frame.attr('width')) - margin.left - margin.right;
      height = Number(frame.attr('height')) - margin.top - margin.bottom;
      xScale = d3.scale.linear().domain([minX, maxX]).range([frameXOffset + margin.left, frameXOffset + margin.left + width]);
      return yScale = d3.scale.linear().domain([minY, maxY]).range([frameYOffset + height + margin.top, frameYOffset + margin.top]);
    };
    setScales();
    line = d3.svg.line().x(function(d, i) {
      return xScale(d[0]);
    }).y(function(d, i) {
      return yScale(d[1]);
    });
    plot = svg.insert('g', '#oscope');
    path = plot.append('path').data([dataBuffer]).attr('class', 'line').attr('d', line);
    proxy = {};
    proxy.setScales = setScales;
    base = this;
    addProperty = function(name, cb) {
      var f;
      f = function(val) {
        if (val != null) {
          base[name] = val;
          if (cb != null) {
            cb();
          }
          return proxy;
        } else {
          return base[name];
        }
      };
      return proxy[name] = f;
    };
    _ref = ['minX', 'maxX', 'minY', 'maxY'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      addProperty(name, proxy.setScales);
    }
    _ref1 = ['margin', 'width'];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      name = _ref1[_j];
      addProperty(name);
    }
    proxy.reset = function() {
      var t, _k, _len2;
      for (_k = 0, _len2 = dataBuffer.length; _k < _len2; _k++) {
        t = dataBuffer[_k];
        dataBuffer.pop();
      }
      dataBuffer.pop();
      dataXOffset = 0.0;
      setScales();
      return proxy;
    };
    dataFn = function() {
      return void 0;
    };
    proxy.data = function(d) {
      console.log('data() got: ' + d);
      if (!(d != null)) {
        return dataFn;
      } else if ($.isFunction(d)) {
        dataFn = d;
      } else {
        dataFn = function() {
          return d;
        };
      }
      return proxy;
    };
    proxy.plot = function() {
      var t, x, xval, y, _k, _len2, _ref2;
      _ref2 = dataFn(), x = _ref2[0], y = _ref2[1];
      xval = x - dataXOffset;
      if (xval > maxX) {
        for (_k = 0, _len2 = dataBuffer.length; _k < _len2; _k++) {
          t = dataBuffer[_k];
          dataBuffer.pop();
        }
        dataBuffer.pop();
        dataXOffset = x;
        xval = 0.0;
      }
      dataBuffer.push([xval, y]);
      path.data([dataBuffer]).attr('d', line);
      return proxy;
    };
    return proxy;
  };

  root = typeof window !== "undefined" && window !== null ? window : exports;

  root.oscilloscope = oscilloscope;

}).call(this);
