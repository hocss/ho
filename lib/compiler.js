
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var path = require('path');
var fs = require('fs');

var chalk = require('chalk');
var HoCompiler = require('ho-compiler');

var Logger = require('./utils').Logger;
var LOGLEVELS = require('./utils').LOGLEVELS;

module.exports = class Compiler {
  constructor(argv) {
    this.compile = () => {
      // Create new transform stream
      let compiler = new HoCompiler({
        paths: this.argv.paths ? this.argv.paths.split(':') : null,
        compress: !this.argv.debug,
        sourceMap: this.argv.debug,
        filename: this.argv.entry
      });

      compiler.on('error', this.error);

      let entrypath = path.resolve(this.argv.entry);
      fs.stat(entrypath, err => {
        if (err) {
          this.error('Entry file not found');
          this.verbose(err);
          return;
        }

        let rs = fs.createReadStream(this.argv.entry);
        let ws = fs.createWriteStream(this.argv.output);

        // Map keys to transform streams
        let transforms = this.transforms.map(transform => {
          let Transformer = require(transform);
          return new Transformer(this.config[transform]);
        });

        this.log(chalk.green('Writing'), this.argv.output);

        // Add the output write stream to the end of the list of transforms
        // Add compiler to the front of the queue of transforms
        transforms.unshift(compiler);
        transforms.push(ws);

        // Pipe from read, through transforms and into write
        transforms.reduce((prev, curr) => {
          if (!curr) {
            return prev;
          }

          return prev.pipe(curr);
        }, rs);
      });
    };

    this.argv = argv;

    this.logger = new Logger({
      loglevel: this.argv.verbose ? LOGLEVELS.verbose : LOGLEVELS.info
    });
    this.log = this.logger.shorthand('log');
    this.verbose = this.logger.shorthand('verbose');
    this.error = this.logger.shorthand('error');

    /**
     * Use config to specify transforms to apply to less -> css pipe
     * Transforms should be specified with their module name and their
     * config options will be passed to their constructor. Transforms
     * are expected to be transform streams.
     * @see README for more info
     */
    this.transforms = [];
    if (this.argv.config) {
      this.config = this.getConfig(this.argv.config);
      this.verbose('Using config file', chalk.yellow(this.argv.config));

      if (!Object.keys(this.config).length) {
        this.error('No keys found in config');
        return;
      }

      this.transforms = Object.keys(this.config);
      this.verbose.apply(this, ['Using transforms'].concat(_toConsumableArray(this.transforms.map(transform => chalk.yellow(transform)))));

      this.transforms.forEach(transform => {
        this.log(chalk.magenta('Applying transform'), transform);
      });
    }
  }

  getConfig(filepath) {
    try {
      let file = fs.readFileSync(filepath, {
        encoding: 'utf8'
      });
      let conf = JSON.parse(file);
      return conf.ho || conf;
    } catch (err) {
      this.error('Error reading configuration file');
      this.verbose(err);
      throw new Error(err);
    }
  }

};