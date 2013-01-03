
root = window ? exports

root.registry = []
root.scenes = {}
root.stages = []

currentStack = []
currentObj = undefined

pushCurrent = (obj) ->
    currentStack.push(currentObj)
    currentObj = obj

popCurrent = ->
    currentObj = currentStack.pop()


# popcorn.js obj
pop = undefined


class LessonElement

    constructor: (@elementId) ->
        registry[@elementId] = this
        @children = []

    addChild: (child) ->
        @children.push(child)
        child.parent = this

    init: ->
        if @children?
            child.init() for child in @children

    runStartingAt: (index, cb) ->
        console.log('runStartAt index: ' + index)
        if index > @children.length - 1
            cb() if cb?
            return

        @children[index].run(=> this.runStartingAt(index+1, cb))

    run: (cb) ->
        console.log('RUN')
        console.log(cb)
        if @children?
            @runStartingAt(0, cb)
        else
            cb() if cb?



class Scene extends LessonElement
    constructor: (@title, elId) ->
        if not elId?
            eleId = @title

        super(elId)
        scenes[elId] = this

    run: (cb) ->
        @init()
        console.log('scene[' + @elementId + ']')
        super(cb)

class Beat extends LessonElement

    stage: (s) ->
        if s?
            @stageObj = s
        else
            return @stageObj

    run: (cb) ->
        console.log('beat[' + @elementId + ']')
        @stageObj.show() if @stageObj?

        hideStageWhenDone = =>
            @stageObj.hide() is @stageObj?
            console.log('cb after hiding: ')
            console.log(cb)
            cb() if cb?

        super(hideStageWhenDone)

class Video extends LessonElement
    constructor: (@url, @text) ->

    init: ->
        if not pop?
            pop = Popcorn.smart('#vid', @url)
        super()

    show: ->
        pop.load(@url)
        d3.select('#video').transition().style('opacity', 1.0).duration(1000)

    hide: ->
        d3.select('#video').transition().style('opacity', 0.0).duration(1000)

    run: (cb) ->
        console.log('play video')

        if cb?
            untriggeringcb = ->
                pop.off('ended', cb)
                cb()
            pop.on('ended', untriggeringcb)
        pop.play()

class Line extends LessonElement

    constructor: (@audio, @text, @state) ->

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
                    cb() if cb?
        )

        for k,v of @state
            @parent.stage()[k] = v


class PlayAction extends LessonElement
    constructor: (stageId) ->
    run: (cb) ->
        @parent.stage().play()
        cb()

class StopAndResetAction extends LessonElement

    constructor: (stageId) ->
    run: (cb) ->
        @parent.stage().stop()
        cb()


class WaitAction extends LessonElement
    constructor: (@delay) ->
    run: (cb) ->
        console.log('waiting ' + @delay + ' ms...')
        setTimeout(cb, @delay)


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

    init: ->
        @stage = @parent.stage()
        console.log('got stage = ' + @stage)
        super()

    getElapsedTime: ->
        now = new Date().getTime()
        return now - @startTime

    transitionState: (state, cb) ->
        stateObj = @states[state]

        # pin some values to the object to make the DSL work
        # as if by magic (sort of)
        stateObj.elapsedTime = @getElapsedTime()
        stateObj.stage = @stage

        console.log('TRANSITION OF: state: ' + state)
        transitionTo = stateObj.transition()
        console.log('TRANSITION TO: state: ' + transitionTo)

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



root.scene = (sceneId, title) ->
    sceneObj = new Scene(sceneId, title)

    (f) ->
        currentObj = sceneObj
        f()

root.beat = (beatId) ->
    #register the id
    beatObj = new Beat(beatId)

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

root.video = (fileStem, text) ->
    videoObj = new Video(fileStem, text)
    currentObj.addChild(videoObj)
    currentObj.stage(videoObj)

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
