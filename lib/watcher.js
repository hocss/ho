
'use strict';

var path = require('path');

var chalk = require('chalk');
var chokidar = require('chokidar');
var glob = require('glob');

var Logger = require('./utils').Logger;
var LOGLEVELS = require('./utils').LOGLEVELS;

module.exports = class Watcher {
  constructor(argv) {
    this.argv = argv;

    this.logger = new Logger({
      loglevel: this.argv.verbose ? LOGLEVELS.verbose : LOGLEVELS.info
    });
    this.log = this.logger.shorthand('log');
    this.verbose = this.logger.shorthand('verbose');
    this.error = this.logger.shorthand('error');

    this.callbacks = [];
  }

  /**
   * Registers a function to call when a file changes
   */
  register(fn) {
    this.callbacks.push(fn);
  }

  /**
   * Starts the watcher
   */
  watch() {
    glob(this.argv.watch, (err, files) => {
      if (err) {
        this.error(err);
        return;
      }

      let watcher = chokidar.watch(files).on('change', filepath => {
        this.log(chalk.yellow('change'), filepath);

        // Invoke registered change callbacks
        this.callbacks.forEach(cb => cb());
      }).on('ready', () => {
        this.log('Watching for changes...');
        // List watched files
        var filepath = '';
        Object.keys(watcher._watched).forEach(key => {
          Object.keys(watcher._watched[key]._items).forEach(item => {
            filepath = path.join(key, item);
            this.verbose(chalk.cyan('watch'), filepath.replace(process.env.PWD + '/', ''));
          });
        });
      });
    });
  }

};