(function() {
  var HodgkinHuxleyNeuron,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HodgkinHuxleyNeuron = common.sim.HodgkinHuxleyNeuron;

  common.sim.LinearCompartmentModelSim = (function(_super) {

    __extends(LinearCompartmentModelSim, _super);

    function LinearCompartmentModelSim(nCompartments) {
      var c, _i, _j, _len, _ref, _ref1, _results;
      this.nCompartments = nCompartments;
      this.cIDs = (function() {
        _results = [];
        for (var _i = 0, _ref = this.nCompartments - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      this.compartments = (function() {
        var _j, _len, _ref1, _results1;
        _ref1 = this.cIDs;
        _results1 = [];
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          c = _ref1[_j];
          _results1.push(HodgkinHuxleyNeuron());
        }
        return _results1;
      }).call(this);
      console.log(this.compartments);
      this.t = this.compartments[0].t;
      this.R_a = this.prop(10.0);
      this.v = (function() {
        var _j, _len, _ref1, _results1;
        _ref1 = this.cIDs;
        _results1 = [];
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          c = _ref1[_j];
          _results1.push(0.0);
        }
        return _results1;
      }).call(this);
      this.I = (function() {
        var _j, _len, _ref1, _results1;
        _ref1 = this.cIDs;
        _results1 = [];
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          c = _ref1[_j];
          _results1.push(0.0);
        }
        return _results1;
      }).call(this);
      _ref1 = this.cIDs;
      for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
        c = _ref1[_j];
        this['v' + c] = this.prop(0.0);
        this['I' + c] = this.prop(0.0);
      }
      this.unpackArrays();
    }

    LinearCompartmentModelSim.prototype.unpackArrays = function() {
      var c, _i, _len, _ref, _results;
      _ref = this.cIDs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        this['v' + c](this.v[c]);
        _results.push(this['I' + c](this.I[c]));
      }
      return _results;
    };

    LinearCompartmentModelSim.prototype.reset = function() {
      var s, _i, _len, _ref, _results;
      if (this.compartments != null) {
        _ref = this.compartments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _results.push(s.reset());
        }
        return _results;
      }
    };

    LinearCompartmentModelSim.prototype.step = function() {
      var I, Iexts, c, compartment, v_rest, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      Iexts = [];
      v_rest = this.compartments[0].V_rest();
      _ref = this.cIDs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        I = 0.0;
        if (c > 0) {
          I += this.compartments[c - 1].v() / this.R_a();
        } else {
          I += v_rest / this.R_a();
        }
        if (c < this.nCompartments - 1) {
          I += this.compartments[c + 1].v() / this.R_a();
        } else {
          I += v_rest / this.R_a();
        }
        I -= 2 * this.compartments[c].v() / this.R_a();
        this.compartments[c].I_a(I);
      }
      _ref1 = this.compartments;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        compartment = _ref1[_j];
        compartment.step();
      }
      _ref2 = this.cIDs;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        c = _ref2[_k];
        this.v[c] = this.compartments[c].v();
        this.I[c] = this.compartments[c].I_ext();
      }
      return this.unpackArrays();
    };

    return LinearCompartmentModelSim;

  })(common.PropsEnabled);

  common.sim.LinearCompartmentModel = function(n) {
    return new common.sim.LinearCompartmentModelSim(n);
  };

}).call(this);
