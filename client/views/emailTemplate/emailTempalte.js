EmailTemplateController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('emailTemplateMergeFields'), Meteor.subscribe('emailTemplates')];
  },
  data: function () {
    Session.set('templateId', this.params._id);
  },
  action: function () {
    if (!this.ready()) {
      this.render('loadingContactable');
      return;
    }
    this.render('emailTemplate')
  },
  onAfterAction: function () {

  }
});

if(window.wysihtml5){
  var NODE_NAME= 'INPUT',
    dom = wysihtml5.dom;
  function _format(composer, attributes) {
    var doc             = composer.doc,
      tempClass       = "_wysihtml5-temp-" + (+new Date()),
      tempClassRegExp = /non-matching-class/g,
      i               = 0,
      length,
      anchors,
      anchor,
      hasElementChild,
      isEmpty,
      elementToSetCaretAfter,
      textContent,
      whiteSpace,
      j;
    wysihtml5.commands.formatInline.exec(composer, undefined, NODE_NAME, tempClass, tempClassRegExp);
    anchors = doc.querySelectorAll(NODE_NAME + "." + tempClass);
    length  = anchors.length;
    for (; i<length; i++) {
      anchor = anchors[i];
      anchor.removeAttribute("class");

      anchor.setAttribute('value', attributes.displayName);
      //anchor.innerHTML = attributes.path;
      anchor.setAttribute('data-mergeField', attributes._id);
      anchor.setAttribute('disabled', "disabled");
      anchor.setAttribute('style', "text-align: center;border-radius: 2px; border: solid 1px #007AFF; color: #007AFF;");
    }

    elementToSetCaretAfter = anchor;
    if (length === 1) {
      textContent = dom.getTextContent(anchor);
      hasElementChild = !!anchor.querySelector("*");
      isEmpty = textContent === "" || textContent === wysihtml5.INVISIBLE_SPACE;
      if (!hasElementChild && isEmpty) {
        dom.setTextContent(anchor, attributes.text || anchor.href);
        whiteSpace = doc.createTextNode(" ");
        composer.selection.setAfter(anchor);
        composer.selection.insertNode(whiteSpace);
        elementToSetCaretAfter = whiteSpace;
      }
    }
    composer.selection.setAfter(elementToSetCaretAfter);
  }

  wysihtml5.commands.foo = {
   //similar to wysihtml5 link command
    exec: function(composer, command, value) {
      //debugger;
      var anchors = this.state(composer, command);
      if (anchors) {
        // Selection contains links
        composer.selection.executeAndRestore(function() {
          _removeFormat(composer, anchors);
        });
      } else {
        // Create links
        //value = typeof(value) === "object" ? value : { href: value };
        _format(composer, value);
      }
    },

    state: function(composer, command) {
      return wysihtml5.commands.formatInline.state(composer, command, NODE_NAME);
    },

    value: function() {
      return undefined;
    }
  };
}
var editMode = new ReactiveVar(true);
var preview = new ReactiveVar('');

Template.emailTemplate.helpers({
  mergeField: function () {
    return EmailTemplateMergeFields.find();
  },
  editorContext: function () {
    if ( Session.get('templateId')){
      var template = EmailTemplates.findOne(Session.get('templateId'));
      return {value: template ? template.text : ''};
    }
    return {value: ''};
  },
  categoryTypes: function () {
    return _.map(Enums.emailTemplatesCategories, function (val, key) {
      return {
        code: val,
        name: key
      }
    })
  },
  templateName: function () {
    return  Session.get('templateId') ? EmailTemplates.findOne(Session.get('templateId')).name : '';
  },
  isCategorySelected: function () {
    if (Session.get('templateId')){
      var template = EmailTemplates.findOne(Session.get('templateId'));
      return _.contains(template.category, this.code);
    }
  },
  preview: function () {
    return preview.get();
  },
  editMode: function () {
    return editMode.get();
  }
});

Template.emailTemplate.rendered = function () {
  this.$('#mergeFields').select2({
    allowClear: true,
    placeholder: 'Merge Fields'
  });
  this.$('#category').select2();
};

Template.emailTemplate.events({
  'click #add': function (e, ctx) {
    var template ={
      name: $('.templateName').val(),
      text: $('.editor').data('wysihtml5').editor.composer.getValue(),
      category: $('#category').val()
    };

    if (Session.get('templateId')){
      EmailTemplates.update(Session.get('templateId'), {$set: template})
    }else{
      Session.set('templateId', EmailTemplates.insert(template));
    }
    Router.go('/emailTemplates');

  },
  'change #mergeFields': function (e, ctx) {
    var mf = EmailTemplateMergeFields.findOne(e.val);
    if (!mf) return;

    var editorInstance = $('.editor').data('wysihtml5').editor;

    editorInstance.composer.commands.exec("foo", mf);
  },
  'click #preview': function () {
    if (editMode.get()){
      editMode.set(false);
      Meteor.call('getPreview', $('.editor').data('wysihtml5').editor.composer.getValue(), function (err, result) {
        if (err){
          console.log(err);
        }else{
          preview.set(result);
        }
      })
    }else{
      editMode.set(true);
    }
  }
});