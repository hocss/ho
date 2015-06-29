
# Ho ho ho

> The jolly css/less system

## Getting started

```sh
npm i ho
```

You can install as a global if you like, either way you’ll end up with the `ho` executable which can be used to perform various stylesheet related festive shenanigans.


## Compiling

Just want to compile your less, no problem, just give it an entry and output paths

```sh
ho compile -e src/main.less -o dist/styles.css
```

`Ho` will output a few bits and bobs to the console while it’s working so no streaming just yet (it’s getting there).

`Ho` has a load of built-in help for more options—for compiling most just specify parameters for [less](http://lesscss.org/#using-less-command-line-usage) to use

```sh
ho compile -h
```


## Watching

Watching is pretty handy, it’d be useful if there was a shorthand for it, oh wait a sec...

```sh
ho watch -w 'src/**/*.less' -e src/main.less -o dist/styles.css
```

Watch will fire a compile on file change event so it accepts the same parameters as compile plus the glob to watch for. If your shell auto-expands globs (which is likely) then pass it through as a string, `ho` will expand it.


## Help

`Ho` tries to be self documenting, but if you’re really stuck then open an issue or try stack overflow

```sh
ho <command> --help
```


## Transforms and configuration

Specify a custom set of transforms and their configuration using an external file and the `-c` flag

```sh
ho <command> -c .horc
```

You can specify a custom file if you like but using the `package.json` will work just as well, just add a `ho` key for your configuration

```sh
ho <command> -c package.json
```

```json
...,
"ho": {
  "autoprefixer-transform": {
    "browsers": [
      "last 2 versions"
    ]
  }
},
...
```

The configuration block should specify a list of modules as keys to include in the transform pipeline, each module will be instantiated using the values in the config as their constructor params. So, the previous example will work out something like this in code:

```node
let Transform = require( 'autoprefixer-transform' )
let transform = new Transform({
  browsers: [
    'last 2 versions'
  ]
})
```

This transform will then get appended to the transform pipeline and will end up outputted to a write stream pointed whether you specified with `-o`.

### Custom transforms

There are a few caveats to creating custom transforms

* They should extend `Stream.Transform` or a comparable stream abstraction
* Use the module name as the key in the configuration
* The module declaration should specify a constructor function which will be invoked with the options set out in the configuration file

Thats about it, eventually we’ll let `Ho` output to a `stdout` which would make this sort of thing more robust but for now if you want something else just wrap it in a transform stream and you’re good to go ([example](https://github.com/hocss/autoprefixer-transform/blob/master/lib/index.js))
