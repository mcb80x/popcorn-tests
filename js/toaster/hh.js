(function() {
  var HodgHux, HodgkinHuxleyNeuron, SquareWavePulse, ViewModel, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HodgkinHuxleyNeuron = common.sim.HodgkinHuxleyNeuron;

  SquareWavePulse = common.sim.SquareWavePulse;

  ViewModel = common.ViewModel;

  root = typeof window !== "undefined" && window !== null ? window : exports;

  HodgHux = (function(_super) {

    __extends(HodgHux, _super);

    function HodgHux() {
      return HodgHux.__super__.constructor.apply(this, arguments);
    }

    HodgHux.prototype.init = function() {
      var pulse,
        _this = this;
      this.sim = HodgkinHuxleyNeuron();
      pulse = SquareWavePulse().interval([0.0, 1.0]).amplitude(15.0).I_stim(this.sim.I_ext).t(this.sim.t);
      this.inheritProperties(this.sim, ['t', 'v', 'm', 'n', 'h', 'I_Na', 'I_K', 'I_L']);
      this.inheritProperties(this.sim, ['gbar_Na', 'gbar_K', 'gbar_L', 'I_ext']);
      this.NaChannelVisible = ko.observable(true);
      this.KChannelVisible = ko.observable(true);
      this.OscilloscopeVisible = ko.observable(false);
      this.NaChannelOpen = ko.computed(function() {
        return _this.m() > 0.5;
      });
      this.KChannelOpen = ko.computed(function() {
        return _this.n() > 0.65;
      });
      this.BallAndChainOpen = ko.computed(function() {
        return _this.h() > 0.3;
      });
      svgbind.bindVisible('#NaChannel', this.NaChannelVisible);
      svgbind.bindVisible('#KChannel', this.KChannelVisible);
      svgbind.bindMultiState({
        '#NaChannelClosed': false,
        '#NaChannelOpen': true
      }, this.NaChannelOpen);
      svgbind.bindMultiState({
        '#KChannelClosed': false,
        '#KChannelOpen': true
      }, this.KChannelOpen);
      svgbind.bindMultiState({
        '#BallAndChainClosed': false,
        '#BallAndChainOpen': true
      }, this.BallAndChainOpen);
      svgbind.bindAttr('#NaArrow', 'opacity', this.I_Na, d3.scale.linear().domain([0, -100]).range([0, 1.0]));
      svgbind.bindAttr('#KArrow', 'opacity', this.I_K, d3.scale.linear().domain([20, 100]).range([0, 1.0]));
      ko.applyBindings(this);
      this.oscope = oscilloscope('#art svg', '#oscope').data(function() {
        return [_this.sim.t(), _this.sim.v()];
      });
      util.floatOverRect('#art svg', '#floatrect', '#floaty');
      this.runSimulation = true;
      this.maxSimTime = 10.0;
      this.oscope.maxX = this.maxSimTime;
      this.iterations = 0;
      return this.updateTimer = void 0;
    };

    HodgHux.prototype.play = function() {
      var update,
        _this = this;
      update = function() {
        _this.sim.step();
        if (isNaN(_this.sim.v())) {
          _this.stop();
        }
        _this.oscope.plot();
        if (_this.sim.t() >= _this.maxSimTime) {
          _this.sim.reset();
          _this.oscope.reset();
          return _this.iterations += 1;
        }
      };
      return this.updateTimer = setInterval(update, 100);
    };

    HodgHux.prototype.stop = function() {
      if (this.updateTimer) {
        return clearInterval(this.updateTimer);
      }
    };

    HodgHux.prototype.svgDocumentReady = function(xml) {
      var importedNode;
      importedNode = document.importNode(xml.documentElement, true);
      d3.select('#art').node().appendChild(importedNode);
      d3.select('#art').transition().style('opacity', 1.0).duration(1000);
      return this.init();
    };

    HodgHux.prototype.show = function() {
      var _this = this;
      console.log('showing');
      return d3.xml('svg/membrane_hh_raster_shadows_embedded.svg', 'image/svg+xml', function(xml) {
        return _this.svgDocumentReady(xml);
      });
    };

    HodgHux.prototype.hide = function() {
      this.runSimulation = false;
      return d3.select('#art').transition().style('opacity', 0.0).duration(1000);
    };

    return HodgHux;

  })(common.ViewModel);

  root.stages['hodghux'] = new HodgHux();

}).call(this);
