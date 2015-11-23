
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var chalk = require('chalk');

/**
 * Loglevel enum
 */
const LOGLEVELS = exports.LOGLEVELS = {
  silly: 0,
  verbose: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5
};

// Private write function symbol for Logger
var write = Symbol('write');

// Default log option hash
var logOpts = {
  loglevel: LOGLEVELS.info,
  title: '  [ho]',
  suppressed: false
};

/**
 * @class Logger
 * @description Friendly wrapper around console log
 */
class Logger {
  constructor(opts) {
    let options = Object.assign(logOpts, opts);

    // Dirty copy opts to class
    for (let _ref of Object.entries(options)) {
      var _ref2 = _slicedToArray(_ref, 2);

      let key = _ref2[0];
      let value = _ref2[1];

      if (!this[key]) {
        this[key] = value;
      }
    }

    // Add private write function
    this[write] = (function () {
      var _console;

      if (this.suppressed) {
        return;
      }

      (_console = console).log.apply(_console, [chalk.grey(this.title)].concat(Array.prototype.slice.call(arguments)));
    }).bind(this);
  }

  /**
   * Returns a bound method to allow shorthand calling
   * e.g. this.log instead of this.logger.log
   */
  shorthand(method) {
    if (!this[method]) {
      throw new Error('Attempting to access unknown Logger method');
    }

    return this[method].bind(this);
  }

  /**
   * Equivalent to info level logs
   */
  log() {
    if (this.loglevel > LOGLEVELS.info) {
      return;
    }

    this[write].apply(this, arguments);
  }

  /**
   * Verbose logging
   */
  verbose() {
    var _console2;

    if (this.loglevel > LOGLEVELS.verbose) {
      return;
    }

    (_console2 = console).log.apply(_console2, [chalk.blue(this.title)].concat(Array.prototype.slice.call(arguments)));
  }

  /**
   * Error happening here
   */
  error() {
    var _console3;

    (_console3 = console).log.apply(_console3, [chalk.red(this.title + ' ERROR')].concat(_toConsumableArray([].map.call(arguments, arg => chalk.red(arg)))));
  }
}
exports.Logger = Logger;