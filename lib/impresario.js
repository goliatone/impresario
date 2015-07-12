/*
 * impresario
 * https://github.com/goliatone/impresario
 *
 * Copyright (c) 2015 goliatone
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('gextend');
var _inherit = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var _format = require('util').format;

var DEFAULTS = {
    autoinitialize: true,
    optional: [],
    required: [],
    //TODO: This should be an empty array, and
    //have secrets be its own plugin
    loadFiles: [],
    secrets:{
        path: './.secrets.json',
        load: false
    },
    doLoadEnvironment: false,
    defaults: {}
};

function Impresario(config){

    if(!(this instanceof Impresario)){
        return new Impresario(config);
    }

    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(Impresario, EventEmitter);

Impresario.DEFAULTS = DEFAULTS;

Impresario.REQUIRED_PROPERTY = 'Impresario required property "%s" not available';
Impresario._format = _format;

Impresario.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    this._loaders = [];

    extend(this, this.constructor.DEFAULTS, config);

    var fileLoader = require('./file');
    this.loadFiles.map(function(file){
        this.use(fileLoader.loader.bind(null, file), fileLoader.id + file);
    }, this);


    if(this.doLoadEnvironment){
        var environmentLoader = require('./environment');
        this.use(environmentLoader.loader, environmentLoader.id);
    }

    var defaultsLoader = require('./defaults');
    this.use(defaultsLoader.loader, defaultsLoader.id);

    return this;
};

Impresario.prototype.load = function(){

    var defaults = Array.prototype.slice.call(arguments, 0);

    // var loaded = [];
    //TODO: Move this to module, async loader
    // this._loaders.map(function(loader){
    //     var conf = loader.call(this);
    //     if(Object.keys(conf).length === 0) return;
    //     loaded.push(conf);
    // }, this);
    var self = this;
    var loaded = this._loaders.reduce(function(p, loader) {
            return p.then(function(conf){
                console.log('ARGUMENT')
                return loader();
            });
    }, Promise.resolve());

    loaded.then(function(loaded, b){
        console.log('LOADED', b )
       self._onLoaded(defaults, loaded);
    }).catch(function(e){
        console.error('ERROR', e.message, e.stack);
    });
};

Impresario.prototype._onLoaded = function(defaults, loaded){


    var config = this._loadUserDefaults(defaults, loaded);

    config = this._loadRequired(config);

    config = this._loadOptional(config);

    this.emit('loaded', config);
};



Impresario.prototype.use = function(loader, id){
    // this._loaderIds =
    this._loaders.push(loader);
};

//TODO: This is actually TreeHugger, how to we use it locally?
/*Impresario.loadEnvironment = function(name, prefix){
    prefix = prefix || 'NODE';

    function environmentName(str, prefix){
        str = str || '';
        prefix = prefix || '';
        str = prefix + '_' + str;
        str = str.replace(/\W+/g, '_'
                .replace(/([a-z\d])([A-Z])/g, '$1_$2'));
        str = str.toUpperCase();
        return str;
    }

    var envName = environmentName(name, 'NODE_TREEHUGHER');
    if(process.env[envName]) return;
    process.env[envName] = Date.now();

    var secrets = loadSecret('./.secrets.json');
    var varName;
    Object.keys(secrets).map(function(key){
        varName = environmentName(key, prefix);
        process.env[varName] = secrets[key];
    });
};*/

Impresario.prototype.logger = console;


//////////////////////////////////////////
/// PRIVATE METHODS
//////////////////////////////////////////

/**
 * Load default objects passed in as
 * "load" arguments, this are the user defaults.
 *
 * We can also pass in process.argv processed by
 * a library like commander
 *
 * @param  {Array} defaults Array of default objects
 * @param  {Array} loaded   Array of loaded objects
 * @return {Object}          Merged object
 */
Impresario.prototype._loadUserDefaults = function(defaults, loaded){
    var configs = ([{}].concat(loaded)).concat(defaults);
    var config = extend.apply(null, configs);
    return config;
};

Impresario.prototype._loadRequired = function(config){
    if(!this.required || !this.required.length) return config;

    this.required.map(function(prop){
        //If we do not have a required option, throw
        //if we do, then store
        if(config.hasOwnProperty(prop)) return;
        //Shoult we emit error instead?
        this.emit('error', new Error(_format(Impresario.REQUIRED_PROPERTY, prop)));
    }, this);

    /*
     * Required props should not be filtered by
     * optional loader.
     */
    this.optional = this.optional.concat(this.required);

    return config;
};

Impresario.prototype._loadOptional = function(config){
    if(!this.optional || !this.optional.length) return config;

    var output = {};
    this.optional.map(function(key){
        output[key] = config[key];
    });
    return output;
};


/*
function loadSecret(filename){
    var fs = require('fs');
    var resolve = require('path').resolve;
    var join = require('path').join;

    var file,
        config = {};

    try {
        file = fs.readFileSync(filename, 'utf-8');
    } catch(e) {
        console.log('FILE DOES NOT EXISTS', filename);
        return config;
    }

    try {
        config = JSON.parse(file);
    } catch(e){
        console.log(e);
        return config;
    }

    return config;
}
*/
/**
 * Exports module
 */
module.exports = Impresario;
