
import fs from 'fs'
import path from 'path'

import chalk from 'chalk'
import HoCompiler from 'ho-compiler'

import { Logger, LOGLEVELS } from './utils'


export default class Compiler {
    constructor( argv ) {

        this.argv = argv

        this.logger = new Logger({
            loglevel: this.argv.verbose ? LOGLEVELS.verbose : LOGLEVELS.info
        })
        this.log = this.logger.shorthand( 'log' )
        this.verbose = this.logger.shorthand( 'verbose' )
        this.error = this.logger.shorthand( 'error' )

        /**
         * Use config to specify transforms to apply to less -> css pipe
         * Transforms should be specified with their module name and their
         * config options will be passed to their constructor. Transforms
         * are expected to be transform streams.
         * @see README for more info
         */
        this.transforms = []
        if ( this.argv.config ) {
            this.config = this.getConfig( this.argv.config )
            this.verbose( 'Using config file', chalk.yellow( this.argv.config ) )

            if ( !Object.keys( this.config ).length ) {
                this.error( 'No keys found in config' )
                return
            }

            this.verbose( 'Found transforms' )
            this.transforms = Object.keys( this.config )

            this.transforms.forEach( transform => {
                this.log( chalk.magenta( 'Applying transform' ), transform )
            })


            // Map keys to transform objects
            // this.transforms = this.transforms.map( transform => {
            //     let Transformer = require( transform )
            //     this.log( chalk.magenta( 'Applying transform' ), transform )
            //     return new Transformer( this.config[ transform ] )
            // })
        }
    }

    getConfig( filepath ) {
        try {
            let file = fs.readFileSync( filepath, {
                encoding: 'utf8'
            })
            let conf = JSON.parse( file )
            return conf.ho || conf
        } catch( err ) {
            this.error( 'Error reading configuration file' )
            this.verbose( err )
            throw new Error( err )
        }

    }

    compile = () => {
        // Create new transform stream
        let compiler = new HoCompiler({
            paths: this.argv.paths ? this.argv.paths.split( ':' ) : null,
            compress: !this.argv.debug,
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

            // Map keys to transform streams
            let transforms = this.transforms.map( transform => {
                let Transformer = require( transform )
                return new Transformer( this.config[ transform ] )
            })

            this.log( chalk.green( 'Writing' ), this.argv.output )

            // Add the output write stream to the end of the list of transforms
            // Add compiler to the front of the queue of transforms
            transforms.unshift( compiler )
            transforms.push( ws )

            // Pipe from read, through transforms and into write
            transforms.reduce( ( prev, curr ) => {
                if ( !curr ) {
                    return prev
                }

                return prev.pipe( curr )
            }, rs )
        })
    }

}
