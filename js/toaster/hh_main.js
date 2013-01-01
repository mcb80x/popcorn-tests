(function() {
  var HodgkinHuxleyNeuron, SquareWavePulse, ViewModel, initializeSimulation, svgDocumentReady;

  HodgkinHuxleyNeuron = common.sim.HodgkinHuxleyNeuron;

  SquareWavePulse = common.sim.SquareWavePulse;

  ViewModel = common.ViewModel;

  initializeSimulation = function() {
    var maxSimTime, oscope, pulse, runSimulation, sim, update, updateTimer, vm, watchDog;
    sim = HodgkinHuxleyNeuron();
    pulse = SquareWavePulse().interval([0.0, 1.0]).amplitude(15.0).I_stim(sim.I_ext).t(sim.t);
    vm = new ViewModel();
    vm.inheritProperties(sim, ['t', 'v', 'm', 'n', 'h', 'I_Na', 'I_K', 'I_L']);
    vm.inheritProperties(sim, ['gbar_Na', 'gbar_K', 'gbar_L', 'I_ext']);
    vm.NaChannelVisible = ko.observable(true);
    vm.KChannelVisible = ko.observable(true);
    vm.OscilloscopeVisible = ko.observable(false);
    vm.NaChannelOpen = ko.computed(function() {
      return vm.m() > 0.5;
    });
    vm.KChannelOpen = ko.computed(function() {
      return vm.n() > 0.65;
    });
    vm.BallAndChainOpen = ko.computed(function() {
      return vm.h() > 0.3;
    });
    svgbind.bindVisible('#NaChannel', vm.NaChannelVisible);
    svgbind.bindVisible('#KChannel', vm.KChannelVisible);
    svgbind.bindMultiState({
      '#NaChannelClosed': false,
      '#NaChannelOpen': true
    }, vm.NaChannelOpen);
    svgbind.bindMultiState({
      '#KChannelClosed': false,
      '#KChannelOpen': true
    }, vm.KChannelOpen);
    svgbind.bindMultiState({
      '#BallAndChainClosed': false,
      '#BallAndChainOpen': true
    }, vm.BallAndChainOpen);
    svgbind.bindAttr('#NaArrow', 'opacity', vm.I_Na, d3.scale.linear().domain([0, -100]).range([0, 1.0]));
    svgbind.bindAttr('#KArrow', 'opacity', vm.I_K, d3.scale.linear().domain([20, 100]).range([0, 1.0]));
    ko.applyBindings(vm);
    oscope = oscilloscope('#art svg', '#oscope').data(function() {
      return [sim.t(), sim.v()];
    });
    util.floatOverRect('#art svg', '#floatrect', '#floaty');
    runSimulation = true;
    maxSimTime = 10.0;
    oscope.maxX = maxSimTime;
    update = function() {
      sim.step();
      if (isNaN(sim.v())) {
        runSimulation = false;
        console.log('stopping sim...');
        return;
      }
      oscope.plot();
      if (sim.t() >= maxSimTime) {
        sim.reset();
        return oscope.reset();
      }
    };
    updateTimer = setInterval(update, 100);
    watchDog = function() {
      if (!runSimulation) {
        return clearInterval(updateTimer);
      }
    };
    return setInterval(watchDog, 500);
  };

  svgDocumentReady = function(xml) {
    var importedNode;
    d3.select('#avideo').transition().style('opacity', 0.0).duration(1000);
    importedNode = document.importNode(xml.documentElement, true);
    d3.select('#art').node().appendChild(importedNode);
    d3.select('#art').transition().style('opacity', 1.0).duration(1000);
    return initializeSimulation();
  };

  $(function() {
    var pop;
    pop = Popcorn.smart('#vid', 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4');
    pop.on('ended', function() {
      return d3.xml('svg/membrane_hh_raster_shadows_embedded.svg', 'image/svg+xml', svgDocumentReady);
    });
    return pop.play();
  });

}).call(this);
