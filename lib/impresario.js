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


var DEFAULTS = {
    autoinitialize: true,
    optional: [],
    required: [],
    loadFiles: ['./.secrets.json'],
    defaults: {}
};

function Impresario(config){

    if(!(this instanceof Impresario)){
        return new Impresario(options);
    }

    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(Impresario, EventEmitter);

Impresario.DEFAULTS = DEFAULTS;

Impresario.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    this._loaders = [];

    extend(this, this.constructor.DEFAULTS, config);

    this.loadFiles.map(function(file){
        this.use(loadSecret.bind(null, file), 'loadFile');
    }, this);

    this.use(loadEnv, 'loadEnv');

    this.use(loadDefaults.bind(this.defaults), 'defaults');

    return this;
};

Impresario.prototype.load = function(){

    var defaults = Array.prototype.slice.call(arguments, 0);
    var loaded = [];

    this._loaders.map(function(loader){
        var conf = loader.call(this);
        if(Object.keys(conf).length === 0) return;
        loaded.push(conf);
    }, this);

    var configs = ([{}].concat(loaded)).concat(defaults);

    config = extend.apply(null, configs);

    var output = config;

    //POST:
    if(this.required.length > 0) {
        this.required.map(function(prop){
            //If we do not have a required option, throw
            //if we do, then store
            if(config.hasOwnProperty(prop)) return;
            throw new Error('Impresario required property "'+prop+'" not available');
        });

        this.optional = this.optional.concat(this.required);
    }

    if(this.optional.length > 0){
        output = {};
        this.optional.map(function(key){
            output[key] = config[key];
        });
    }



    this.emit('loaded', output);
};

Impresario.prototype.use = function(tx, id){
    if(!this._loaders) this._loaders = [];
    this._loaders.push(tx);
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
