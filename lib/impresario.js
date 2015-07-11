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
    loadFiles: ['./.secrets.json'],
    loadEnvironnment: false,
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

    this.loadFiles.map(function(file){
        this.use(loadSecret.bind(null, file), 'loadFile');
    }, this);

    if(this.loadEnvironnment) this.use(loadEnv, 'loadEnv');

    this.use(loadDefaults.bind(this.defaults), 'defaults');

    return this;
};

Impresario.prototype.load = function(){

    var loaded = [];
    //TODO: Move this to module, async loader
    this._loaders.map(function(loader){
        var conf = loader.call(this);
        if(Object.keys(conf).length === 0) return;
        loaded.push(conf);
    }, this);

    var defaults = Array.prototype.slice.call(arguments, 0);
    var config = this._loadDefaults(defaults, loaded);

    config = this._loadRequired(config);

    config = this._loadOptional(config);

    var self = this;
    process.nextTick(function(){
        self.emit('loaded', config);
    });
    // this.emit('loaded', config);
};

Impresario.prototype._loadDefaults = function(defaults, loaded){
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

Impresario.prototype.use = function(loader, id){
    // this._loaderIds =
    this._loaders.push(loader);
};


Impresario.loadEnvironment = function(name, prefix){
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
};

Impresario.prototype.logger = console;


function loadDefaults(defaults){
    return defaults || {};
}

function loadEnv(){
    // console.log('LOADING ENV');

    function capitalize(str){
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    function solveKeyPath(name){
        var names = name.toLowerCase().split('_');
        name = names.pop(0);
        names.map(function(bit){
            name += capitalize(bit);
        });

        return name;
    }

    var prop, mappedKey, out = {};
    Object.keys(process.env).map(function(key){
        prop = process.env[key];
        mappedKey = solveKeyPath(key);
        out[mappedKey] = prop;
    });

    return out;
}


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
/**
 * Exports module
 */
module.exports = Impresario;
