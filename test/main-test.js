'use strict';

var expect = require('chai').expect;
var getDoctype = require("../lib/get-doctype.js");

describe('parse public doctype', function() {
  it('should return correct "name", "pubid" and "sysid"', function() {
    var xmlFile = __dirname + '/../test/dataset/public.xml';
    getDoctype.parseFile(xmlFile, function(doctype) {
      expect(doctype).to.be.an('object');
      expect(doctype.name).to.equal('TEI.2');
      expect(doctype.pubid).to.equal('-//TEI P4//DTD Main DTD Driver File//EN');
      expect(doctype.sysid).to.equal('http://www.tei-c.org/Lite/DTD/teixlite.dtd');
    });
  });
});

describe('parse system doctype', function() {
  it('should return correct "name" and "sysid"', function() {
    var xmlFile = __dirname + '/../test/dataset/system.xml';
    getDoctype.parseFile(xmlFile, function(doctype) {
      expect(doctype).to.be.an('object');
      expect(doctype.name).to.equal('greeting');
      expect(doctype.sysid).to.equal('hello.dtd');
    });
  });
});

describe('parse local doctype', function() {
  it('should return correct "name"', function() {
    var xmlFile = __dirname + '/../test/dataset/local.xml';
    getDoctype.parseFile(xmlFile, function(doctype) {
      expect(doctype).to.be.an('object');
      expect(doctype.name).to.equal('greeting');
    });
  });
});

describe('parse XML with no doctype', function() {
  it('should return correct "name"', function() {
    var xmlFile = __dirname + '/../test/dataset/no-doctype.xml';
    getDoctype.parseFile(xmlFile, function(doctype) {
      expect(doctype).to.be.an('object');
      expect(doctype.name).to.equal('greeting');
    });
  });
});
