#<< hh
#<< lesson_plan

scene('Action Potential Generation', 'hodgkinhuxley') ->

    beat('Domino analogy') ->
        video 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4', 'subtitle.srt'

    beat('Basic propagation walk-through') ->
        stage 'hodghux'

        wait 500

        line 'ap_line1',
            "We're now going to let the simulation run for one iteration",
            {'NaChannelVisible': true, 'KChannelVisible': false} # <-- settings for the stage

        play 'hodghux'

        goal ->
            initial:
                transition: ->
                    if @stage.iterations >= 1
                        return 'continue'
                    else if @elapsedTime > 10000
                        return 'hint1'
            hint1:
                action: ->
                    line 'hint1', "This message will pop up after 10 seconds, just ignore it"

                transition: -> 'initial'

        line 'ap_line1',
            "And now back to the popcorn"


    beat('Another beat') ->
        video 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4',
            'blah'

