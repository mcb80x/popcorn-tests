(function() {
  var Beat, FSM, LessonElement, Line, PlayAction, Scene, StopAndResetAction, Video, WaitAction, currentObj, currentStack, pop, popCurrent, pushCurrent, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof window !== "undefined" && window !== null ? window : exports;

  root.registry = [];

  root.scenes = {};

  root.stages = [];

  currentStack = [];

  currentObj = void 0;

  pushCurrent = function(obj) {
    currentStack.push(currentObj);
    return currentObj = obj;
  };

  popCurrent = function() {
    return currentObj = currentStack.pop();
  };

  pop = void 0;

  LessonElement = (function() {

    function LessonElement(elementId) {
      this.elementId = elementId;
      registry[this.elementId] = this;
      this.children = [];
    }

    LessonElement.prototype.addChild = function(child) {
      this.children.push(child);
      return child.parent = this;
    };

    LessonElement.prototype.init = function() {
      var child, _i, _len, _ref, _results;
      if (this.children != null) {
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.init());
        }
        return _results;
      }
    };

    LessonElement.prototype.runStartingAt = function(index, cb) {
      var _this = this;
      console.log('runStartAt index: ' + index);
      if (index > this.children.length - 1) {
        if (cb != null) {
          cb();
        }
        return;
      }
      return this.children[index].run(function() {
        return _this.runStartingAt(index + 1, cb);
      });
    };

    LessonElement.prototype.run = function(cb) {
      console.log('RUN');
      console.log(cb);
      if (this.children != null) {
        return this.runStartingAt(0, cb);
      } else {
        if (cb != null) {
          return cb();
        }
      }
    };

    return LessonElement;

  })();

  Scene = (function(_super) {

    __extends(Scene, _super);

    function Scene(title, elId) {
      var eleId;
      this.title = title;
      if (!(elId != null)) {
        eleId = this.title;
      }
      Scene.__super__.constructor.call(this, elId);
      scenes[elId] = this;
    }

    Scene.prototype.run = function(cb) {
      this.init();
      console.log('scene[' + this.elementId + ']');
      return Scene.__super__.run.call(this, cb);
    };

    return Scene;

  })(LessonElement);

  Beat = (function(_super) {

    __extends(Beat, _super);

    function Beat() {
      return Beat.__super__.constructor.apply(this, arguments);
    }

    Beat.prototype.stage = function(s) {
      if (s != null) {
        return this.stageObj = s;
      } else {
        return this.stageObj;
      }
    };

    Beat.prototype.run = function(cb) {
      var hideStageWhenDone,
        _this = this;
      console.log('beat[' + this.elementId + ']');
      if (this.stageObj != null) {
        this.stageObj.show();
      }
      hideStageWhenDone = function() {
        _this.stageObj.hide() === (_this.stageObj != null);
        console.log('cb after hiding: ');
        console.log(cb);
        if (cb != null) {
          return cb();
        }
      };
      return Beat.__super__.run.call(this, hideStageWhenDone);
    };

    return Beat;

  })(LessonElement);

  Video = (function(_super) {

    __extends(Video, _super);

    function Video(url, text) {
      this.url = url;
      this.text = text;
    }

    Video.prototype.init = function() {
      if (!(pop != null)) {
        pop = Popcorn.smart('#vid', this.url);
      }
      return Video.__super__.init.call(this);
    };

    Video.prototype.show = function() {
      pop.load(this.url);
      return d3.select('#video').transition().style('opacity', 1.0).duration(1000);
    };

    Video.prototype.hide = function() {
      return d3.select('#video').transition().style('opacity', 0.0).duration(1000);
    };

    Video.prototype.run = function(cb) {
      var untriggeringcb;
      console.log('play video');
      if (cb != null) {
        untriggeringcb = function() {
          pop.off('ended', cb);
          return cb();
        };
        pop.on('ended', untriggeringcb);
      }
      return pop.play();
    };

    return Video;

  })(LessonElement);

  Line = (function(_super) {

    __extends(Line, _super);

    function Line(audio, text, state) {
      this.audio = audio;
      this.text = text;
      this.state = state;
    }

    Line.prototype.init = function() {
      this.div = $('#prompt_overlay');
      this.div.hide();
      return Line.__super__.init.call(this);
    };

    Line.prototype.run = function(cb) {
      var k, v, _ref, _results;
      this.div.text(this.text);
      this.div.dialog({
        dialogClass: 'noTitleStuff',
        resizable: true,
        title: null,
        height: 300,
        modal: true,
        buttons: {
          'continue': function() {
            $(this).dialog('close');
            if (cb != null) {
              return cb();
            }
          }
        }
      });
      _ref = this.state;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(this.parent.stage()[k] = v);
      }
      return _results;
    };

    return Line;

  })(LessonElement);

  PlayAction = (function(_super) {

    __extends(PlayAction, _super);

    function PlayAction(stageId) {}

    PlayAction.prototype.run = function(cb) {
      this.parent.stage().play();
      return cb();
    };

    return PlayAction;

  })(LessonElement);

  StopAndResetAction = (function(_super) {

    __extends(StopAndResetAction, _super);

    function StopAndResetAction(stageId) {}

    StopAndResetAction.prototype.run = function(cb) {
      this.parent.stage().stop();
      return cb();
    };

    return StopAndResetAction;

  })(LessonElement);

  WaitAction = (function(_super) {

    __extends(WaitAction, _super);

    function WaitAction(delay) {
      this.delay = delay;
    }

    WaitAction.prototype.run = function(cb) {
      console.log('waiting ' + this.delay + ' ms...');
      return setTimeout(cb, this.delay);
    };

    return WaitAction;

  })(LessonElement);

  FSM = (function(_super) {

    __extends(FSM, _super);

    function FSM(states) {
      var actionObj, k, v, _ref;
      this.states = states;
      FSM.__super__.constructor.call(this);
      this.currentState = 'initial';
      this.delay = 500;
      this.startTime = void 0;
      _ref = this.states;
      for (k in _ref) {
        v = _ref[k];
        actionObj = new LessonElement();
        pushCurrent(actionObj);
        if (v.action != null) {
          v.action();
        }
        popCurrent();
        this.states[k].action = actionObj;
        this.addChild(actionObj);
      }
    }

    FSM.prototype.init = function() {
      this.stage = this.parent.stage();
      console.log('got stage = ' + this.stage);
      return FSM.__super__.init.call(this);
    };

    FSM.prototype.getElapsedTime = function() {
      var now;
      now = new Date().getTime();
      return now - this.startTime;
    };

    FSM.prototype.transitionState = function(state, cb) {
      var stateObj, t, transitionTo,
        _this = this;
      stateObj = this.states[state];
      stateObj.elapsedTime = this.getElapsedTime();
      stateObj.stage = this.stage;
      console.log('TRANSITION OF: state: ' + state);
      transitionTo = stateObj.transition();
      console.log('TRANSITION TO: state: ' + transitionTo);
      if (transitionTo != null) {
        if (transitionTo === 'continue') {
          if (cb != null) {
            return cb();
          }
        } else {
          return this.runState(transitionTo, cb);
        }
      } else {
        t = function() {
          return _this.transitionState(state, cb);
        };
        return setTimeout(t, this.delay);
      }
    };

    FSM.prototype.runState = function(state, cb) {
      var _this = this;
      console.log('ACTION: state: ' + state);
      this.startTime = new Date().getTime();
      if (this.states[state].action != null) {
        return this.states[state].action.run(function() {
          return _this.transitionState(state, cb);
        });
      } else {
        return this.transitionState(state, cb);
      }
    };

    FSM.prototype.run = function(cb) {
      console.log('running fsm');
      return this.runState('initial', cb);
    };

    return FSM;

  })(LessonElement);

  root.scene = function(sceneId, title) {
    var sceneObj;
    sceneObj = new Scene(sceneId, title);
    return function(f) {
      currentObj = sceneObj;
      return f();
    };
  };

  root.beat = function(beatId) {
    var beatObj;
    beatObj = new Beat(beatId);
    currentObj.addChild(beatObj);
    return function(f) {
      pushCurrent(beatObj);
      f();
      return popCurrent();
    };
  };

  root.stage = function(name) {
    var s;
    s = stages[name];
    return currentObj.stage(s);
  };

  root.line = function(text, audio, state) {
    var lineObj;
    lineObj = new Line(text, audio, state);
    return currentObj.addChild(lineObj);
  };

  root.lines = line;

  root.video = function(fileStem, text) {
    var videoObj;
    videoObj = new Video(fileStem, text);
    currentObj.addChild(videoObj);
    return currentObj.stage(videoObj);
  };

  root.play = function(name) {
    var runObj;
    runObj = new PlayAction(name);
    return currentObj.addChild(runObj);
  };

  root.wait = function(delay) {
    var waitObj;
    waitObj = new WaitAction(delay);
    return currentObj.addChild(waitObj);
  };

  root.stop_and_reset = function(name) {
    var stopResetObj;
    stopResetObj = new StopAndResetAction(name);
    return currentObj.addChild(stopResetObj);
  };

  root.goal = function(f) {
    var goalObj;
    goalObj = new FSM(f());
    return currentObj.addChild(goalObj);
  };

  root.fsm = goal;

}).call(this);
