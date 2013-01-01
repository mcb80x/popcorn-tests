(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  common.sim.HHSimulationRK4 = (function(_super) {

    __extends(HHSimulationRK4, _super);

    function HHSimulationRK4() {
      this.I_ext = this.prop(0.0);
      this.I_a = this.prop(0.0);
      this.dt = this.prop(0.05);
      this.C_m = this.prop(1.0);
      this.gbar_Na = this.prop(120);
      this.gbar_K = this.prop(36);
      this.gbar_L = this.prop(0.3);
      this.V_rest = this.prop(0.0);
      this.V_offset = this.prop(-65.0);
      this.E_Na = this.prop(115 + this.V_rest());
      this.E_K = this.prop(-12 + this.V_rest());
      this.E_L = this.prop(10.6 + this.V_rest());
      this.defineProps(['I_Na', 'I_K', 'I_L', 'g_Na', 'g_K', 'g_L'], 0.0);
      this.defineProps(['v', 'm', 'n', 'h', 't'], 0.0);
      this.reset();
      this.rk4 = true;
    }

    HHSimulationRK4.prototype.reset = function() {
      var v_;
      this.v(this.V_rest());
      v_ = this.v();
      this.m(this.alphaM(v_) / (this.alphaM(v_) + this.betaM(v_)));
      this.n(this.alphaN(v_) / (this.alphaN(v_) + this.betaN(v_)));
      this.h(this.alphaH(v_) / (this.alphaH(v_) + this.betaH(v_)));
      this.state = [this.v(), this.m(), this.n(), this.h()];
      return this.t(0.0);
    };

    HHSimulationRK4.prototype.step = function(stepCallback) {
      var dt, i, k1, k2, k3, k4, svars, t;
      this.t(this.t() + this.dt());
      t = this.t();
      dt = this.dt();
      svars = [0, 1, 2, 3];
      k1 = this.ydot(t, this.state);
      if (this.rk4) {
        k2 = this.ydot(t + (dt / 2), (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = svars.length; _i < _len; _i++) {
            i = svars[_i];
            _results.push(this.state[i] + (dt * k1[i] / 2));
          }
          return _results;
        }).call(this));
        k3 = this.ydot(t + dt / 2, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = svars.length; _i < _len; _i++) {
            i = svars[_i];
            _results.push(this.state[i] + (dt * k2[i] / 2));
          }
          return _results;
        }).call(this));
        k4 = this.ydot(t + dt, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = svars.length; _i < _len; _i++) {
            i = svars[_i];
            _results.push(this.state[i] + dt * k3[i]);
          }
          return _results;
        }).call(this));
        this.state = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = svars.length; _i < _len; _i++) {
            i = svars[_i];
            _results.push(this.state[i] + (dt / 6.0) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
          }
          return _results;
        }).call(this);
      } else {
        this.state = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = svars.length; _i < _len; _i++) {
            i = svars[_i];
            _results.push(state[i] + dt * k1[i]);
          }
          return _results;
        })();
      }
      this.v(this.state[0] + this.V_offset());
      this.m(this.state[1]);
      this.n(this.state[2]);
      this.h(this.state[3]);
      if (stepCallback != null) {
        return stepCallback();
      }
    };

    HHSimulationRK4.prototype.alphaM = function(v) {
      return 0.1 * (25.0 - v) / (Math.exp(2.5 - 0.1 * v) - 1.0);
    };

    HHSimulationRK4.prototype.betaM = function(v) {
      return 4 * Math.exp(-1 * v / 18.0);
    };

    HHSimulationRK4.prototype.alphaN = function(v) {
      return 0.01 * (10 - v) / (Math.exp(1.0 - 0.1 * v) - 1.0);
    };

    HHSimulationRK4.prototype.betaN = function(v) {
      return 0.125 * Math.exp(-v / 80.0);
    };

    HHSimulationRK4.prototype.alphaH = function(v) {
      return 0.07 * Math.exp(-v / 20.0);
    };

    HHSimulationRK4.prototype.betaH = function(v) {
      return 1.0 / (Math.exp(3.0 - 0.1 * v) + 1.0);
    };

    HHSimulationRK4.prototype.ydot = function(t, s) {
      var dh, dm, dn, dv, dy, h, m, n, v;
      v = s[0], m = s[1], n = s[2], h = s[3];
      this.g_Na(this.gbar_Na() * Math.pow(m, 3) * h);
      this.g_K(this.gbar_K() * Math.pow(n, 4));
      this.g_L(this.gbar_L());
      this.I_Na(this.g_Na() * (v - this.E_Na()));
      this.I_K(this.g_K() * (v - this.E_K()));
      this.I_L(this.g_L() * (v - this.E_L()));
      dv = (this.I_ext() + this.I_a() - this.I_Na() - this.I_K() - this.I_L()) / this.C_m();
      dm = this.alphaM(v) * (1.0 - m) - this.betaM(v) * m;
      dn = this.alphaN(v) * (1.0 - n) - this.betaN(v) * n;
      dh = this.alphaH(v) * (1.0 - h) - this.betaH(v) * h;
      dy = [dv, dm, dn, dh];
      return dy;
    };

    return HHSimulationRK4;

  })(common.PropsEnabled);

  common.sim.HodgkinHuxleyNeuron = function() {
    return new common.sim.HHSimulationRK4();
  };

}).call(this);
