/* jshint worker:true */
/* global Jison,ebnf,parser */
importScripts('./jison.js');
Jison.print = function () {};

function compileGrammar(self, grammar) {
  var compiledGrammar;

  try {
    compiledGrammar = JSON.parse(grammar);
  } catch (e) {
    // intentionally throw an error here if it fails to parse
    compiledGrammar = bnf.parse(grammar);
  }

  var compiledParser = new Jison.Parser(compiledGrammar).generate();

  self.postMessage({compiledGrammar: compiledGrammar, compiledParser: compiledParser});
}

function parseText(self, request) {
  var textToParse = request.textToParse;
  eval(request.compiledParser); // creates a global "parser" object
  var compiledParser = parser;

  Jison.lexDebugger = [];
  var parsedResult = compiledParser.parse(textToParse);

  self.postMessage({parsedResult: parsedResult, lexDebugger: Jison.lexDebugger});
}

// request to parse a grammar
self.addEventListener('message', function (e) {
  if (e.data.grammar) {
    compileGrammar(self, e.data.grammar);
  } else {
    parseText(self, e.data);
  }
});