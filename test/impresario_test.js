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
            var conf = new Impresario();
            assert.instanceOf(conf, Impresario);
        });

        it('should create instance with "optional" and "required" props', function(){
            var conf = new Impresario();
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
            var B = {port: '3030', username: 'goliatone'};

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
        });

        it('should merge default objects', function(done){
            var A = {
                url: 'http://localhost'
            };

            var B = {
                port: '3030',
                username: 'goliatone'
            };

            var expected = {
                port: '3030',
                username: 'goliatone',
                url: 'http://localhost'
            };

            Impresario({
                optional: ['username', 'port', 'url']
            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load(A, B);
        });

        it('should merge default objects from left to right', function(done){
            var A = {
                port: '0000',
                url: 'http://localhost'
            };

            var B = {
                port: '3030',
                username: 'goliatone'
            };

            var expected = {
                port: '3030',
                username: 'goliatone',
                url: 'http://localhost'
            };

            Impresario({
                optional: ['username', 'port', 'url']
            }).on('loaded', function(conf){
                assert.deepEqual(conf, expected);
                done();
            }).load(A, B);
        });
    });

    describe('load defaults' , function(){
        it('should handle multiple objects', function(){
            var i = new Impresario({});
            var expected = {a: 1, b: 2, c: 3};
            var A = {a: 1}, B = {b: 2, c: 3};
            var result = i._loadUserDefaults(B, A);
            assert.isObject(result);
            assert.deepEqual(result, expected);
        });
    });
});

function _fixture(file){
    var data = require(fixture(file));
    return data;
}
