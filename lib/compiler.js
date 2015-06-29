
import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import HoCompiler from 'ho-compiler'

import { Logger, LOGLEVELS } from './utils'


export default class Compiler {
    constructor( argv ) {

        this.argv = argv

        this.logger = new Logger({
            loglevel: argv.verbose ? LOGLEVELS.verbose : LOGLEVELS.info
        })
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )
        this.error = this.logger.shorthand( 'error' )
    }

    compile = () => {
        // Create new transform stream
        let compiler = new HoCompiler({
            paths: this.argv.paths ? this.argv.paths.split( ':' ) : null,
            compress: this.argv.debug,
            sourceMap: this.argv.debug,
            filename: this.argv.entry
        })

        compiler.on( 'error', this.error )

        let entrypath = path.resolve( this.argv.entry )
        fs.stat( entrypath, err => {
            if ( err ) {
                this.error( 'Entry file not found' )
                this.verbose( err )
                return
            }

            let rs = fs.createReadStream( this.argv.entry )
            let ws = fs.createWriteStream( this.argv.output )

            this.log( chalk.green( 'Writing' ), this.argv.output )

            rs
                .pipe( compiler )
                .pipe( ws )
        })
    }

}
