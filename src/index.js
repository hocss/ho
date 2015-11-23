
require( 'babel-polyfill' )

var Compiler = require( './compiler' )
var Watcher = require( './watcher' )


function makeArgs( args ) {
  return args
    .option( 'e', {
      alias: 'entry',
      describe: 'Main entry path for less compilation',
      demand: true,
      type: 'string'
    })
    .option( 'o', {
      alias: 'output',
      describe: 'Output path',
      demand: true,
      type: 'string'
    })
    .option( 'p', {
      alias: 'paths',
      describe: 'Colon separated list of search paths for @import directives',
      demand: false,
      type: 'string'
    })
    .option( 'd', {
      alias: 'debug',
      describe: 'Start in debug mode which enables source-mapping',
      type: 'boolean'
    })
    .option( 'verbose', {
      describe: 'Sets up verbose logging',
      type: 'boolean'
    })
    .option( 'c', {
      alias: 'config',
      describe: 'Supply config details as json - give it a path to some json',
      demand: false,
      type: 'string'
    })
    .help( 'h' )
    .alias( 'h', 'help' )
}

var argv = require( 'yargs' )
  .usage( 'Usage: $0 <command> [options]' )
  .command( 'compile', 'Compiles Less into CSS', function( yargs ) {
    var compiler = new Compiler( makeArgs( yargs ).argv )
    compiler.compile()
  })
  .command( 'watch', 'Starts watching files', function( yargs ) {
    var watchArgv = makeArgs( yargs )
      .option( 'w', {
          alias: 'watch',
          describe: 'Glob to watch for changes',
          demand: true,
          type: 'string'
      })
      .help( 'h' )
      .alias( 'h', 'help ')
      .argv

    var compiler = new Compiler( watchArgv )
    var watcher = new Watcher( watchArgv )

    watcher.register( compiler.compile )
    watcher.watch()
  })
  .help( 'h' )
  .alias( 'h', 'help' )
  .argv
