'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var path = require('path');
var fixture = path.resolve.bind(path, __dirname, 'fixtures');

sinon.assert.expose(assert, { prefix: '' });

var Impresario = require('..');


describe('impresario', function(){

    describe('constructor', function(){
        it('should provide a DEFAULTS object', function(){
            assert.isObject(Impresario.DEFAULTS);
        });

        it('should return a impresario instance if called without new', function(){
            var conf = Impresario();
            assert.instanceOf(conf, Impresario);
        });

        it('should create instance with "optional" and "required" props', function(){
            var conf = Impresario();
            assert.ok(conf.required);
            assert.ok(conf.optional);
        });
    });


    describe('load' , function(){
        it('should load default items', function(done){
            var expected = {
                url: 'http://localhost',
                port: '3030',
                username: 'goliatone'
            };
            var A = {url:'http://localhost'};
            var B = {port: '3030', username: 'goliatone'}

            Impresario({
            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load(A, B);
        });

        it('should throw if required fields are not found', function(done){
            var expected = Impresario._format(Impresario.REQUIRED_PROPERTY, 'password');
            Impresario({
                required: ['password']
            }).on('error', function(err){
                assert.equal(expected, err.message);
                done();
            }).load();
        });

        it('should return all keys if "optional" is not defined', function(done){
            var expected = {
                url: 'http://localhost',
                port: '3030',
                username: 'goliatone'
            };

            Impresario({

            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load(expected);
        });

        it('should return only optional keys if present', function(done){
            var defaults = {
                url: 'http://localhost',
                port: '3030',
                username: 'goliatone'
            };

            var expected = {
                username: 'goliatone'
            };

            Impresario({
                optional: ['username']
            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load(defaults);
        });

        it('should load files', function(done){
            var expected = _fixture('secrets.json');
            Impresario({
                loadFiles: [fixture('secrets.json')]
            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load();
        })
    });

    describe('load' , function(){
        // Impresario({
        //     name: 'event-stream',
        //     required: ['host'],
        //     optional: ['sessionId', 'username', 'password', 'loggerKey']
        // }).on('loaded', done).load(program);
    });
});

function _fixture(file){
    var data = require(fixture(file));
    return data;
}