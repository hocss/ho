
# Ho ho ho

> The jolly css/less system

## Getting started

```bash
npm i ho
```

You can install as a global if you like, either way you’ll end up with the `ho` executable which can be used to perform various stylesheet related festive shenanigans.


## Compiling

Just want to compile your less, no problem, just give it an entry and output paths

```
ho compile -e src/main.less -o dist/styles.css
```

`Ho` will output a few bits and bobs to the console while it’s working so no streaming just yet (it’s getting there).

`Ho` has a load of built-in help for more options—for compiling most just specify parameters for [less](http://lesscss.org/#using-less-command-line-usage) to use

```
ho compile -h
```


## Watching

Watching is pretty handy, it’d be useful if there was a shorthand for it, oh wait a sec...

```
ho watch -w 'src/**/*.less' -e src/main.less -o dist/styles.css
```

Watch will fire a compile on file change event so it accepts the same parameters as compile plus the glob to watch for. If your shell auto-expands globs (which is likely) then pass it through as a string, `ho` will expand it.


## Help

`Ho` tries to be self documenting, but if you’re really stuck then open an issue or try stack overflow

```
ho <command> --help
```
