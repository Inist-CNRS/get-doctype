/* global require, __dirname, describe */
/*jslint indent: 2 */

'use strict';

var expect = require('chai').expect;
var getDoctype = require("../lib/get-doctype.js");

describe('get-doctype', function () {
  describe('#parseFile()', function () {

    it('with *public doctype* should return correct "name", "pubid" and "sysid"', function (done) {
      var xmlFile = __dirname + '/../test/dataset/long.xml';
      getDoctype.parseFile(xmlFile, function (err, doctype) {
//        console.log(err || doctype || "");
        expect(doctype).to.be.an('object');
        expect(doctype.name).to.equal('TEI.2');
        expect(doctype.pubid).to.equal('-//TEI P4//DTD Main DTD Driver File//EN');
        expect(doctype.sysid).to.equal('http://www.tei-c.org/Lite/DTD/teixlite.dtd');

        done();
      });

    });

    it('with *system doctype* should return correct "name" and "sysid"', function (done) {
      var xmlFile = __dirname + '/../test/dataset/system.xml';
      getDoctype.parseFile(xmlFile, function (err, doctype) {
//        console.log(err || doctype || "");
        expect(doctype).to.be.an('object');
        expect(doctype.name).to.equal('greeting');
        expect(doctype.sysid).to.equal('hello.dtd');

        done();
      });
    });

    it('with *local doctype* should return correct "name"', function (done) {
      var xmlFile = __dirname + '/../test/dataset/local.xml';
      getDoctype.parseFile(xmlFile, function (err, doctype) {

        expect(doctype).to.be.an('object');
        expect(doctype.name).to.equal('greeting');

        done();
      });
    });

    it('with *no doctype* should return `Error` "No doctype found"', function (done) {
      var xmlFile = __dirname + '/../test/dataset/no-doctype.xml';
      getDoctype.parseFile(xmlFile, function (err, doctype) {

        expect(err.message).to.equal('No doctype found');

        done();
      });
    });

    it('with *brill_156* should return `Error` "No doctype found"', function (done) {
      var xmlFile = __dirname + '/../test/dataset/Brill_15685152_021_02_S08_text.xml';
      getDoctype.parseFile(xmlFile, function (err, doctype) {
//        console.log(err || doctype || "");

        expect(err.message).to.contain("No doctype found");

        done();
      });
    });

  });


  describe.skip('Parse doctype', function () {
    it('should work with the parseString function', function (done) {

      var xmlString = '<?xml version="1.0"?><!DOCTYPE greeting SYSTEM "hello.dtd"><greeting>Hello, world!</greeting>';
      getDoctype.parseString(xmlString, function (err, doctype) {

        expect(doctype).to.be.an('object');
        expect(doctype.name).to.equal('greeting');
        expect(doctype.sysid).to.equal('hello.dtd');

        done();
      });
    });
  });

});