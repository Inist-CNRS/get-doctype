/*
 * Javascript module for parsing doctypes in XML document.
 * Useful to get name, pubid and sysid whithout parsing the whole XML document
 * Make usage of existing module :
 *   - saxjs for SAX parsing XML document (https://github.com/isaacs/sax-js)
 *   - piece of code of "xmldom" for splitting doctype into correc parts (https://github.com/jindw/xmldom, split function of sax.js file)
 */

'use strict';

var PARSE_TYPE_STRING = 1;
var PARSE_TYPE_FILE = 2;
var PARSE_TYPE_STDIN = 3;

var fs = require('fs');

var normalEnding = false;

exports.parseFile = function(path, callback) {
  parse(PARSE_TYPE_FILE, path, callback);
}

exports.parseString = function(xmlString, callback) {
  parse(PARSE_TYPE_STRING, xmlString, callback);
}

exports.parseStdin = function(callback) {
  parse(PARSE_TYPE_STDIN, null, callback);
}

var parse = function(parseType, whatToParse, callback) {

  // object which will be displayed as output
  var doctype = new Object();

  var saxStream = require("sax").createStream(true);

  switch (parseType) {
    case PARSE_TYPE_STDIN:
      //parsing from stdin
      process.stdin.pipe(saxStream);
      break;
    case PARSE_TYPE_STRING:
      //parsing a XML String
      var Stream = require('stream')
      var stream = new Stream();
      stream.pipe = function(dest) {
        dest.write(whatToParse);
      }
      stream.pipe(saxStream);
      break;
    default:
      //parsing from a file
      if (fs.existsSync(whatToParse)) {
        fs.createReadStream(whatToParse).pipe(saxStream);
      } else {
        throw new Error("File to parse \"" + whatToParse + "\" not found\n");
      }
  }

  // doctype tag read, trying to "smart" parse it
  saxStream.on("doctype", function(doctypeString) {

    var trimmedDoctype = doctypeString.replace(/\s+/g, ' ').trim();

    // try to know the kind of doctype (public, system or local)œ
    var doctypeParts = trimmedDoctype.split(" ");
    if (doctypeParts[1] === "PUBLIC") {
      doctype.type = doctypeParts[1];
    } else if (doctypeParts[1] === "SYSTEM") {
      doctype.type = doctypeParts[1];
      delete doctype.pubid;
    } else if (doctypeParts[1].charAt(0)) {
      doctype.type = "LOCAL";
      doctype.pubid;
      doctype.sysid;
    }

    var start = 0;
    var dt = "<!DOCTYPE " + trimmedDoctype + ">";

    // split the doctype to get name and identifiers
    var matchs = split(dt, start);

    var len = matchs.length;
    if (len > 1 && /!doctype/i.test(matchs[0][0])) {
      doctype.name = matchs[1][0];
      if (doctype.type === 'PUBLIC') {
        doctype.pubid = len > 3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
        doctype.pubid = doctype.pubid.substring(1, doctype.pubid.length - 1);
        doctype.sysid = len > 4 && matchs[4][0];
        doctype.sysid = doctype.sysid.substring(1, doctype.sysid.length - 1);
      } else if (doctype.type === 'SYSTEM') {
        doctype.sysid = len > 3 && matchs[3][0];
        doctype.sysid = doctype.sysid.substring(1, doctype.sysid.length - 1);
      }
    } else {
      throw new Error("Unable to parse doctype\n");
    }

    callback(doctype);
  });


  // Don't need to parse the whole document, only the doctype is interesting
  // So, we pause the parser
  saxStream.on("opentag", function(node) {
    normalEnding = true;
    this._parser.close();
  });

  //Error parsing the XML document
  saxStream.on("error", function(err) {
    // opened a tag.  node has "name" and "attributes"
    if (!normalEnding) throw new Error("SAX parsing problem", err);
  });

}

/*
 * Split the doctype string
 * Thanks to https://github.com/jindw/xmldom
 */

function split(source, start) {
  var match;
  var buf = [];
  var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
  reg.lastIndex = start;
  reg.exec(source); //skip <
  while (match = reg.exec(source)) {
    buf.push(match);
    if (match[1]) return buf;
  }
}