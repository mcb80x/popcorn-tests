
root = window ? exports

root.registry = []
root.scenes = {}
root.stages = []

# Infrastructure for managing the 'current' object
# in our little imperative DSL
currentStack = []
currentObj = undefined

pushCurrent = (obj) ->
    currentStack.push(currentObj)
    currentObj = obj

popCurrent = ->
    currentObj = currentStack.pop()


elementCounter = -1
uniqueElementId = ->
    elementCounter += 1
    'element_assigned_id_' + elementCounter

# Lesson Elements
# These are the objects that the DSL will actually build
# They are organized hierarchically with a "Scene" at the
# top level, with story "beats" below
# This code is a bit of a mess at the moment, but it is
# basically functional

# Base LessonElement
class LessonElement

    constructor: (@elementId) ->
        if not @elementId?
            @elementId = uniqueElementId()
        registry[@elementId] = this
        @children = []
        @childIndexLookup = {}
        @parent = undefined

    addChild: (child) ->
        child.parent = this
        @children.push(child)
        @childIndexLookup[child.elementId] = @children.length - 1

    # Init is called after the DOM is fully available
    init: ->
        if @children?
            child.init() for child in @children


    resumeAfter: (childId, cb) ->
        console.log('resumeAfter: ' + childId)

        if not @children? or @children.length is 0
            @parent.resumeAfter(@elementId, cb)
        childIndex = @childIndexLookup[childId]
        @resumeAfterIndex(childIndex, cb)

    resumeAfterIndex: (childIndex, cb) ->
        nextIndex = childIndex + 1
        if @children[nextIndex]?
            @children[nextIndex].run()
        else
            @yield(cb)


    # run starting from one of this element's children
    # this call allows recursive function call chaining
    runChildrenStartingAtIndex: (index, cb) ->
        console.log('runStartingAtIndex index: ' + index)
        if index > @children.length - 1
            @yield(cb)
            return

        @children[index].run(=>
            @runChildrenStartingAtIndex(index+1, cb)
        )

    yield: (cb) ->
        if @parent?
            @parent.resumeAfter(@elementId, cb)
        else
            console.log('no parent:')
            console.log(this)
            cb()

    # Run through this element and all of its children
    run: (cb) ->

        if not @children?
            cb()
        else
            @runChildrenStartingAtIndex(0, cb)


    runAtPath: (path, cb) ->
        if path is ''
            @run(cb)
        splitPath = path.split(':')

        head = splitPath.shift()

        @childLookup[head].runAtPath(splitPath.join(':'), cb)

    stop: ->
        child.stop() if child.stop? for child in @children

# Top-level "Scene"
class Scene extends LessonElement
    constructor: (@title, elId) ->
        if not elId?
            eleId = @title

        super(elId)

        # register this scene in the global registry
        scenes[elId] = this

        @currentSegment = ko.observable(undefined)
        @currentTime = ko.observable(undefined)

    run: (cb) ->
        @init()
        console.log('scene[' + @elementId + ']')
        super(cb)




class Interactive extends LessonElement

    constructor: (elId) ->
        @duration = ko.observable(1.0)
        super(elId)

    stage: (s) ->
        if s?
            @stageObj = s
        else
            return @stageObj

    run: (cb) ->
        @parent.currentSegment(@elementId)
        @stageObj.show() if @stageObj?

        hideStageWhenDone = =>
            @stageObj.hide() if @stageObj? and @stageObj.hide?
            cb() if cb?

        super(hideStageWhenDone)

    scene: ->
        return @parent

# A somewhat hacked up video object
class Video extends LessonElement
    constructor: (elId) ->
        @duration = ko.observable(1.0)
        @mediaUrls = {}

        super(elId)

    media: (fileType, url) ->
        if url?
            @mediaUrls[fileType] = url
        else
            return @mediaUrls[fileType]

    mediaTypes: ->
        return [k for k of @mediaUrls]

    subtitles: (f) ->
        # fill me in

    init: ->
        if not @pop?
            @pop = Popcorn.smart('#vid', @media('mp4'))

        @pop.on('durationchange', =>
            console.log('duration changed!:' + @pop.duration())
            @duration(@pop.duration())
        )

        console.log('Loading: ' + @media('mp4'))
        @pop.load(@media('mp4'))

        super()

    show: ->
        d3.select('#video').transition().style('opacity', 1.0).duration(1000)

    hide: ->
        d3.select('#video').transition().style('opacity', 0.0).duration(1000)

    run: (cb) ->

        @parent.currentSegment(@elementId)

        @show()

        scene = @parent
        console.log(scene)

        updateTimeCb = ->
            t = @currentTime()
            scene.currentTime(t)
        @pop.on('timeupdate', updateTimeCb)

        if cb?
            untriggeringcb = =>
                @pop.off('ended', cb)
                @pop.off('updatetime', updateTimeCb)
                @hide()
                cb()
            @pop.on('ended', untriggeringcb)
        @pop.play()

    stop: ->
        @pop.stop()
        @hide()


# A "line" is a bit of audio + text that can be played
# over-top some demo.  If audio is disabled, it will
# display a modal dialog box (audio not yet enabled)

class Line extends LessonElement

    constructor: (@audio, @text, @state) ->
        super()

    init: ->
        #@div = d3.select('#prompt_overlay')
        @div = $('#prompt_overlay')
        @div.hide()
        super()

    run: (cb) ->
        @div.text(@text)
        @div.dialog(
            dialogClass: 'noTitleStuff'
            resizable: true
            title: null
            height: 300
            modal: true
            buttons:
                'continue': ->
                    $(this).dialog('close')
                    console.log(cb)
                    cb() if cb?
        )

        for k,v of @state
            @parent.stage()[k] = v



# Actions to "instruct" a demo to do something

class PlayAction extends LessonElement
    constructor: (@stageId) ->
        super()

    run: (cb) ->
        console.log('running play action')
        @parent.stage().play()
        cb()

class StopAndResetAction extends LessonElement

    constructor: (@stageId) ->
        super()

    run: (cb) ->
        @parent.stage().stop()
        cb()


class WaitAction extends LessonElement
    constructor: (@delay) ->
        super()

    run: (cb) ->
        console.log('waiting ' + @delay + ' ms...')
        setTimeout(cb, @delay)

# A finite state machine
# The idea here is to have a simple state machine so
# that simple interactive goals can be easily defined
class FSM extends LessonElement
    constructor: (@states) ->

        super()

        # start out in the 'initial' state
        @currentState = 'initial'
        @delay = 500
        @startTime = undefined

        # convert DSL imperative action definitions
        # to objects
        for k, v of @states
            actionObj = new LessonElement()
            pushCurrent(actionObj)
            if v.action?
                v.action()
            popCurrent()


            @states[k].action = actionObj

            # add the action object to the 'children'
            # member to ensure it is init'd correctly
            @addChild(actionObj)

            # this is a bit arcane: basically,
            # we're forcing the action to call its callback
            # rather than riding back up the hierarchy
            actionObj.parent = undefined

    init: ->
        @stage = @parent.stage()
        console.log('got stage = ' + @stage)
        super()

    getElapsedTime: ->
        now = new Date().getTime()
        return now - @startTime

    transitionState: (state, cb) ->

        console.log('transition to: ' + state)

        stateObj = @states[state]

        # pin some values to the object to make the DSL work
        # as if by magic (sort of)
        stateObj.elapsedTime = @getElapsedTime()
        stateObj.stage = @stage

        transitionTo = stateObj.transition()

        if transitionTo?
            if transitionTo is 'continue'
                cb() if cb?
            else
                @runState(transitionTo, cb)
        else
            t = => @transitionState(state, cb)
            setTimeout(t, @delay)

    runState: (state, cb) ->
        console.log('ACTION: state: ' + state)
        @startTime = new Date().getTime()

        if @states[state].action?
            @states[state].action.run(=> @transitionState(state, cb))
        else
            @transitionState(state, cb)

    run: (cb) ->
        console.log('running fsm')
        @runState('initial', cb)


# Imperative Domain Specific Language bits
# Some slightly abused coffescript syntax to make
# the final script read more like an outline or
# "script" in the lines-in-a-documentary sense of the
# word

root.scene = (sceneId, title) ->
    sceneObj = new Scene(sceneId, title)

    (f) ->
        currentObj = sceneObj
        f()

root.interactive = (beatId) ->
    #register the id
    beatObj = new Interactive(beatId)

    currentObj.addChild(beatObj)

    (f) ->
        pushCurrent(beatObj)
        f()
        popCurrent()

root.stage = (name) ->
    s = stages[name]
    currentObj.stage(s)


root.line = (text, audio, state) ->
    lineObj = new Line(text, audio, state)

    currentObj.addChild(lineObj)

root.lines = line

root.video = (name) ->
    videoObj = new Video(name)
    currentObj.addChild(videoObj)

    (f) ->
        pushCurrent(videoObj)
        f()
        popCurrent()

root.mp4 = (f) ->
    currentObj.media('mp4', f)
root.webm = (f) ->
    currentObj.media('webm', f)

root.subtitles = (f) ->
    currentObj.subtitles(f)

root.duration = (t) ->
    currentObj.duration(t) if currentObj.duration?

root.play = (name) ->
    runObj = new PlayAction(name)
    currentObj.addChild(runObj)

root.wait = (delay) ->
    waitObj = new WaitAction(delay)
    currentObj.addChild(waitObj)

root.stop_and_reset = (name) ->
    stopResetObj = new StopAndResetAction(name)
    currentObj.addChild(stopResetObj)

root.goal = (f) ->
    goalObj = new FSM(f())
    currentObj.addChild(goalObj)

root.fsm = goal
