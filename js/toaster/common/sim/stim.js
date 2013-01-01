(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  common.sim.SquareWavePulseSim = (function(_super) {

    __extends(SquareWavePulseSim, _super);

    function SquareWavePulseSim() {
      var _this = this;
      this.interval = this.prop(3.0);
      this.amplitude = this.prop(15);
      this.t = this.prop(0.0, function() {
        return _this.update();
      });
      this.I_stim = this.prop(0.0);
      this.stimOn = this.prop(false);
    }

    SquareWavePulseSim.prototype.update = function() {
      var e, s, _ref;
      _ref = this.interval(), s = _ref[0], e = _ref[1];
      if (this.t() > s && this.t() < e) {
        this.I_stim(this.amplitude());
        return this.stimOn(true);
      } else {
        this.I_stim(0.0);
        return this.stimOn(false);
      }
    };

    return SquareWavePulseSim;

  })(common.PropsEnabled);

  common.sim.SquareWavePulse = function() {
    return new common.sim.SquareWavePulseSim();
  };

}).call(this);
