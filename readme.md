# MCB80x Hodgkin-Huxley Simulator
Some experiments in building a Hodkin-Huxley simulator for mcb80x.

Live demo: [mcb80x.github.com/hodghux](http://mcb80x.github.com/hodghux)

## Dependencies:

* [jade](http://jade-lang.com)
* [coffeescript](http://coffeescript.org)
* [coffee-toaster](https://github.com/serpentem/coffee-toaster)

```
npm install -g jade
npm install -g coffee-script
npm install -g coffee-toaster
```

## Building

Use the supplied Makefile (builds into a directory called `www`).  `make serve` starts up a simple server on port `8080`.

## License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.en_US"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-sa/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/3.0/deed.en_US">Creative Commons Attribution-ShareAlike 3.0 Unported License</a>.