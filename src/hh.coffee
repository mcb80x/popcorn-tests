# ----------------------------------------------------
# Imports (using coffee-toaster directives)
# ----------------------------------------------------

#<< common/util
#<< common/bindings
#<< common/oscilloscope
#<< common/sim/hh_rk
#<< common/properties
#<< common/sim/stim

#<< lesson_plan

# Import a few names into this namespace for convenience
HodgkinHuxleyNeuron = common.sim.HodgkinHuxleyNeuron
SquareWavePulse = common.sim.SquareWavePulse
ViewModel = common.ViewModel

root = window ? exports


# this is hacky for now
class HodgHux

    init: ->

        # Build a new simulation object
        sim = HodgkinHuxleyNeuron()

        # Build a square-wave pulse object and hook it up
        pulse = SquareWavePulse().interval([0.0, 1.0])
                                 .amplitude(15.0)
                                 .I_stim(sim.I_ext)
                                 .t(sim.t)

        # Build a view model obj to manage KO bindings
        vm = new ViewModel()

        # Bind properties from the simulation to the view model
        vm.inheritProperties(sim, ['t', 'v', 'm', 'n', 'h', 'I_Na', 'I_K', 'I_L'])
        vm.inheritProperties(sim, ['gbar_Na', 'gbar_K', 'gbar_L', 'I_ext'])

        vm.NaChannelVisible = ko.observable(true)
        vm.KChannelVisible = ko.observable(true)
        vm.OscilloscopeVisible = ko.observable(false)

        # Add a few computed / derivative observables
        vm.NaChannelOpen = ko.computed(-> (vm.m() > 0.5))
        vm.KChannelOpen = ko.computed(-> (vm.n() > 0.65))
        vm.BallAndChainOpen = ko.computed(-> (vm.h() > 0.3))

        # Bind data to the svg to marionette parts of the artwork
        svgbind.bindVisible('#NaChannel', vm.NaChannelVisible)
        svgbind.bindVisible('#KChannel', vm.KChannelVisible)
        svgbind.bindMultiState({'#NaChannelClosed':false, '#NaChannelOpen':true}, vm.NaChannelOpen)
        svgbind.bindMultiState({'#KChannelClosed':false, '#KChannelOpen':true}, vm.KChannelOpen)
        svgbind.bindMultiState({'#BallAndChainClosed':false, '#BallAndChainOpen':true}, vm.BallAndChainOpen)

        svgbind.bindAttr('#NaArrow', 'opacity', vm.I_Na, d3.scale.linear().domain([0, -100]).range([0, 1.0]))
        svgbind.bindAttr('#KArrow', 'opacity', vm.I_K, d3.scale.linear().domain([20, 100]).range([0, 1.0]))

        # Set the html-based Knockout.js bindings in motion
        # This will allow templated 'data-bind' directives to automagically control the simulation / views
        ko.applyBindings(vm)

        # Make an oscilloscope and attach it to the svg
        oscope = oscilloscope('#art svg', '#oscope').data(-> [sim.t(), sim.v()])

        # Float a div over a rect in the svg
        util.floatOverRect('#art svg', '#floatrect', '#floaty')

        @runSimulation = true
        maxSimTime = 10.0
        oscope.maxX = maxSimTime

        update = ->

            # Update the simulation
            sim.step()

            # stop if the result is silly
            if isNaN(sim.v())
                @runSimulation = false
                console.log('stopping sim...')
                return

            # Tell the oscilloscope to plot
            oscope.plot()

            if sim.t() >= maxSimTime
                sim.reset()
                oscope.reset()


        updateTimer = setInterval(update, 100)

        # Start a timer to keep an eye on the simulation
        watchDog = =>
            if not @runSimulation
                clearInterval(updateTimer)
        setInterval(watchDog, 500)


    # Main initialization function; triggered after the SVG doc is
    # loaded
    svgDocumentReady: (xml) ->

        # transition out the video if it's visible
        # d3.select('#video').transition().style('opacity', 0.0).duration(1000)

        # Attach the SVG to the DOM in the appropriate place
        importedNode = document.importNode(xml.documentElement, true)
        d3.select('#art').node().appendChild(importedNode)
        d3.select('#art').transition().style('opacity', 1.0).duration(1000)

        @init()


    show: ->
        console.log('showing')
        d3.xml('svg/membrane_hh_raster_shadows_embedded.svg', 'image/svg+xml', (xml) => @svgDocumentReady(xml))

    hide: ->
        @runSimulation = false
        d3.select('#art').transition().style('opacity', 0.0).duration(1000)

root.stages['hodghux'] = new HodgHux()

# $ ->
#     # load the svg artwork and hook everything up
#     d3.xml('svg/membrane_hh_raster_shadows_embedded.svg', 'image/svg+xml', svgDocumentReady)
