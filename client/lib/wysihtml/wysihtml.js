
// WYSIHTML
WYSIHTMLEditor = {};
Template.wysihtml.rendered = function () {
  // Initiialize the content when needed
  if (this.data)
    Template.instance().$('#wysihtml-textarea').val(this.data);

  WYSIHTMLEditor = new wysihtml5.Editor("wysihtml-textarea", {
    toolbar:      "wysihtml-toolbar",
    parserRules:  wysihtml5ParserRules,
    stylesheets: "/voog-wysihtml/stylesheet.css"
  });
};

var htmlView = new ReactiveVar(false);
Template.wysihtml.helpers({
  htmlView: function () {
    return htmlView.get();
  }
});


Template.wysihtml.events({
  'click .insertLink': function () {
    Utils.showModal('basicInputModal', {
      title: 'Insert Link',
      placeholder: 'Enter the link URL',
      value: 'http://',
      acceptText: 'Insert Link',
      callback: function (result) {
        if (result) {
          WYSIHTMLEditor.composer.commands.exec("createLink", {href: result, target: "_blank"});
        }
      }
    });
  },
  'click .insertImage': function () {
    Utils.showModal('basicInputModal', {
      title: 'Insert Image',
      placeholder: 'Enter the image URL',
      value: 'http://',
      acceptText: 'Insert Image',
      callback: function (result) {
        if (result) {
          WYSIHTMLEditor.composer.commands.exec("insertImage", {src: result});
        }
      }
    });
  },
  'click .toggleHTMLView': function () {
    htmlView.set(!htmlView.get());
  }
});
