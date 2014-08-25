#!/usr/bin/env node

var getDoctype = require("./lib/get-doctype.js");

if (process.argv.length < 3) {
  //no argument => read stream from stdin
  getDoctype.parseStdin(function(doctype) {
    console.log(doctype);
  });

} else {
  //read XML file with 1st argument as path
  var xmlPath = process.argv[2];
  getDoctype.parseFile(xmlPath, function(doctype) {
    console.log(doctype);
  });

}
