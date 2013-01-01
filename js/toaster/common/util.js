(function() {
  var resizeHandlers, root, util;

  resizeHandlers = [];

  $(window).resize(function() {
    var f, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = resizeHandlers.length; _i < _len; _i++) {
      f = resizeHandlers[_i];
      _results.push(f());
    }
    return _results;
  });

  util = {
    floatOverRect: function(svgSelector, rectSelector, divSelector) {
      var div, pt, rect, resizeIt, svg;
      svg = d3.select(svgSelector).node();
      rect = d3.select(rectSelector).node();
      div = d3.select(divSelector);
      div.style('position', 'absolute');
      pt = svg.createSVGPoint();
      resizeIt = function() {
        var corners, matrix;
        corners = {};
        matrix = rect.getScreenCTM();
        pt.x = rect.x.animVal.value;
        pt.y = rect.y.animVal.value;
        corners.nw = pt.matrixTransform(matrix);
        pt.x += rect.width.animVal.value;
        corners.ne = pt.matrixTransform(matrix);
        pt.y += rect.height.animVal.value;
        corners.se = pt.matrixTransform(matrix);
        pt.x -= rect.width.animVal.value;
        corners.sw = pt.matrixTransform(matrix);
        div.style('width', corners.ne.x - corners.nw.x);
        div.style('height', corners.se.y - corners.ne.y);
        div.style('top', corners.nw.y);
        return div.style('left', corners.nw.x);
      };
      resizeIt();
      return resizeHandlers.push(resizeIt);
    }
  };

  root = typeof window !== "undefined" && window !== null ? window : exports;

  root.util = util;

}).call(this);
