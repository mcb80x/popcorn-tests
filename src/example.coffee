#<< hh
#<< lesson_plan

scene('Action Potential Generation', 'hodghux') ->

    beat('Domino analogy') ->
        video 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4',
            '0:00' : "We can optionally include a time-coded transcript here"
            '0:05' : "Here's another line, starting at 5 sec in"

    beat('Basic propagation walk-through') ->

        stage 'hodghux', 'demo'

        wait 3000

        line 'ap_line1',
            'This is the text of the line that would be in the audio file',
            {'NaChannelVisible': true, 'KChannelVisible': false} # <-- settings for the stage

    beat('Another beat') ->
        video 'http://videos.mozilla.org/serv/webmademovies/popcornplug.mp4',
            'blah'

        # run 'demo'

        # goal ->
        #   if stage.iterations > 2
        #       next

        # stop_and_reset 'demo'

        # lines 'ap_line2',
        #   '0:00' : 'Here is a file that contains multiple lines'
        #   '0:05' : 'The individual lines can be time coded',
        #   {'KChannelVisisble': true}


        # goal ->
        #   if stage.gbar_Max > 2.0
        #       next
        #   else if time > 10.0
        #       'hint1'

        # element('hint1') ->
        #   line 'ap_hint1', "Here's a sequence that helps the student along"