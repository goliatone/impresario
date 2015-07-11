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
    autoinitialize: true
};

function impresario(config){
    EventEmitter.call(this);
    config = extend({}, this.constructor.DEFAULTS, config);

    if(config.autoinitialize ) this.init(config);
}

_inherit(impresario, EventEmitter);

impresario.DEFAULTS = DEFAULTS;

impresario.prototype.init = function(config){
    if(this.initialized) return;
    this.initialized = true;

    extend(this, this.constructor.DEFAULTS, config);

};

impresario.prototype.logger = console;

/**
 * Exports module
 */
module.exports = impresario;
