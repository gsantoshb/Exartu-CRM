Package.describe({
  summary: "Open source rich text editor for the modern web http://wysihtml.com"
});

Package.on_use(function (api) {
  api.use(['underscore'], 'client');
  api.add_files([
    // Minified Library
    "dist/wysihtml5x-toolbar.min.js",

    // html5 custom parser rules
    "parser_rules/simple_custom.js"

  ], "client");

  api.export('wysihtml5');
  api.export('wysihtml5ParserRules');
});
