#<< hh
#<< lesson_plan

scene('Action Potential Generation', 'hodgkinhuxley') ->

    video('Domino analogy') ->
        mp4 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4'
        subtitles 'subtitle.srt'

    interactive('Basic propagation walk-through') ->
        stage 'hodghux'
        duration 10

        wait 500

        line 'ap_line1',
            "We're now going to let the simulation run for one iteration",
            {'NaChannelVisible': true, 'KChannelVisible': false} # <-- settings for the stage

        play 'beginning'

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


    video('Another beat') ->
        mp4 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4',
            'blah'

