# => SRC FOLDER
toast 'src'

  # EXCLUDED FOLDERS (optional)
  # exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

  # => VENDORS (optional)
  vendors: ['common/third-party/jquery-1.8.3.js',
            'common/third-party/knockout-2.2.0.js',
            'common/third-party/jquery-ui-1.9.2.custom.js',
            'common/third-party/jquery.tipsy.js']

  # => OPTIONS (optional, default values listed)
  # bare: false
  # packaging: false
  # expose: 'window'
  # minify: true

  # => HTTPFOLDER (optional), RELEASE / DEBUG (required)
  httpfolder: 'js'
  release: 'www/js/hh.js'
  debug: 'www/js/hh-debug.js'