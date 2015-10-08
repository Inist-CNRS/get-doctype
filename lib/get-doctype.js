/* global require, exports, e, process */
/*jslint indent: 2 */

/*
 * Javascript module for parsing doctypes in XML document.
 * Useful to get name, pubid and sysid whithout parsing the whole XML document
 * Make usage of existing module :
 *   - saxjs for SAX parsing XML document (https://github.com/isaacs/sax-js)
 *   - piece of code of "xmldom" for splitting doctype into correc parts (https://github.com/jindw/xmldom, split function of sax.js file)
 */
(function () {
  'use strict';

  var PARSE_TYPE_STRING = 1;
  var PARSE_TYPE_FILE = 2;
  var PARSE_TYPE_STDIN = 3;

  var fs = require('fs');

  var
    hasCallback = false
    , _util = {}
  ;

  exports.parseFile = function (path, callback) {
    parse(PARSE_TYPE_FILE, path, callback);
  };

  exports.parseString = function (xmlString, callback) {
    parse(PARSE_TYPE_STRING, xmlString, callback);
  };

  exports.parseStdin = function (callback) {
    parse(PARSE_TYPE_STDIN, null, callback);
  };

  _util.readFileSyncIfExist = function (fileName) {
    var file
      , _msg;

    try {
      file = fs.readFileSync(fileName, "utf8");
    } catch(e) {
      if (e.code === "ENOENT") {
        _msg = "Pas de fichier " + fileName;
        return;
      }
      else {
        throw e;
      }
    }

    return file;
  };

  var parse = function (parseType, whatToParse, callback) {

    // object which will be displayed as output
    var doctype = new Object()
      , saxStream = require("sax").createStream(true)
      , xml
      , matches
      , end
      ;

    switch (parseType) {
      case PARSE_TYPE_STDIN:
        //parsing from stdin
        process.stdin.pipe(saxStream);
        break;
      case PARSE_TYPE_STRING:
        //parsing a XML String
        var Stream = require('stream');
        var stream = new Stream();
        stream.pipe = function (dest) {
          dest.write(whatToParse);
        };
        stream.pipe(saxStream);
        break;
      default:
        //parsing from a file
        xml = _util.readFileSyncIfExist(whatToParse);

        if (!xml) {
          return  callback(new Error("File to parse \"" + whatToParse + "\" not found\n"));
        }

        if (!~xml.substr(0, 200).indexOf("DOCTYPE") && !~xml.substr(0, 200).indexOf("doctype")) {
          return callback(new Error("No doctype found"));
        }

        matches = xml.match(/(?:<\?xml[^>]*\?>)?\s*<!DOCTYPE[^\[>]+(?:\[[^\]]*\])?>/i);

        if (!matches) {
          return callback(new Error("No doctype found"));
        }

        end = matches[0].length;

        fs.createReadStream(whatToParse, {start: 0, end: end}).pipe(saxStream);

    }

    // doctype tag read, trying to "smart" parse it
    saxStream.on("doctype", function (doctypeString) {

      var trimmedDoctype = doctypeString.replace(/\s+/g, ' ').trim();

      // try to know the kind of doctype (public, system or local)œ
      var doctypeParts = trimmedDoctype.split(" ");
      if (doctypeParts[1] === "PUBLIC") {
        doctype.type = doctypeParts[1];
      } else if (doctypeParts[1] === "SYSTEM") {
        doctype.type = doctypeParts[1];
        delete doctype.pubid;
      } else if (doctypeParts[1] && doctypeParts[1].charAt(0)) {
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
          doctype.pubid = len > 3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
          doctype.pubid = doctype.pubid.substring(1, doctype.pubid.length - 1);
          doctype.sysid = len > 4 && matchs[4][0];
          doctype.sysid = doctype.sysid.substring(1, doctype.sysid.length - 1);
        } else if (doctype.type === 'SYSTEM') {
          doctype.sysid = len > 3 && matchs[3][0];
          doctype.sysid = doctype.sysid.substring(1, doctype.sysid.length - 1);
        }
      } else {
        hasCallback = true;
        return callback(new Error("Unable to parse doctype\n"));
      }
//      console.log("#onDoctype", whatToParse, this._parser.position);
      hasCallback = true;
      return callback(null, doctype);
    });

    saxStream.on("error", function (err) {
//      console.log("#onError", err, whatToParse, this._parser.position);
      if (!hasCallback) {
        hasCallback = true;
        if (~String(err).indexOf("Unexpected end")) {
          return  callback(new Error("No doctype found"));
        }

        return  callback(new Error("SAX parsing problem" + err));
      }
    });

    saxStream.on("end", function () {
//      console.log("#onEnd", whatToParse, this._parser.position);
      if (!hasCallback) {
        return  callback(new Error("No doctype found"));
      }
    });

  };

  /*
   * Split the doctype string
   * Thanks to https://github.com/jindw/xmldom
   */

  function split (source, start) {
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
}());
