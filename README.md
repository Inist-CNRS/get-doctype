get-doctype
===========

Javascript module for parsing doctypes in XML document.
Useful to get name, pubid and sysid whithout parsing the whole XML document
Make usage of existing module :
  - saxjs for SAX parsing XML document (https://github.com/isaacs/sax-js)
  - piece of code of "xmldom" for splitting doctype into correc parts (https://github.com/jindw/xmldom, split function of sax.js file)

# Usage
## From command line

Readin a file from its path :
```bash
./parse-doctype test/dataset/public.xml 
```
Output looks like this :
```javascript
{ type: 'PUBLIC',
  name: 'TEI.2',
  pubid: '-//TEI P4//DTD Main DTD Driver File//EN',
  sysid: 'http://www.tei-c.org/Lite/DTD/teixlite.dtd' }
```

Reading stdin :

```bash
cat test/dataset/public.xml | ./parse-doctype
```

If no doctype found or error while parsing file, then an error is thrown.

```bash
./parse-doctype test/dataset/no-doctype.xml
[Error: No doctype found]

./parse-doctype test/dataset/parsing-problem.xml 
[Error: No doctype found, Sax-Error: Unexpected end
Line: 0
Column: 180
Char: ]
```

## From a javascript / nodejs program

Readin a file from its path :

```javascript
var getDoctype = require("get-doctype");
var xmlFile = "test/dataset/public.xml";
getDoctype.parseFile(xmlFile, function(doctype) {
  // Do what you want with the docytype object
});
```

Reading stdin :
```javascript
getDoctype.parseStdin(function (doctype) {
  // Do what you want with the docytype object
});
```

if you want to parse a string containing the XML

```javascript
var xmlString =
    '<?xml version="1.0"?>'
  + '<!DOCTYPE greeting SYSTEM "hello.dtd">'
  + '<greeting>Hello, world!</greeting>';
getDoctype.parseString(xmlString, function(doctype) {
  // Do what you want with the docytype object
});
```
