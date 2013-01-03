(function() {

  scene('Action Potential Generation', 'hodgkinhuxley')(function() {
    beat('Domino analogy')(function() {
      return video('http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4', 'subtitle.srt');
    });
    beat('Basic propagation walk-through')(function() {
      stage('hodghux');
      wait(500);
      line('ap_line1', "We're now going to let the simulation run for one iteration", {
        'NaChannelVisible': true,
        'KChannelVisible': false
      });
      play('hodghux');
      goal(function() {
        return {
          initial: {
            transition: function() {
              if (this.stage.iterations >= 1) {
                return 'continue';
              } else if (this.elapsedTime > 10000) {
                return 'hint1';
              }
            }
          },
          hint1: {
            action: function() {
              return line('hint1', "This message will pop up after 10 seconds, just ignore it");
            },
            transition: function() {
              return 'initial';
            }
          }
        };
      });
      return line('ap_line1', "And now back to the popcorn");
    });
    return beat('Another beat')(function() {
      return video('http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4', 'blah');
    });
  });

}).call(this);
