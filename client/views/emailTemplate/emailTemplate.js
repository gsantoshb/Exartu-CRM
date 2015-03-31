
var template;
EmailTemplateController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('emailTemplateMergeFields'), Meteor.subscribe('emailTemplates')];
  },
  action: function () {
    if (this.params._id) {
      template = EmailTemplates.findOne({_id: this.params._id});
    }
    this.render();
  }
});

Template.emailTemplate.rendered = function () {
  // Initialize select 2 plugings
  this.$('#mergeFields').select2({
    allowClear: true,
    placeholder: 'Select Merge Field'
  });
  this.$('#category').select2({
    placeholder: 'Select the categories for this template'
  });
};


var editMode = new ReactiveVar(true),
    preview = new ReactiveVar(''),
    errorName = new ReactiveVar(''),
    errorSubject = new ReactiveVar('');

Template.emailTemplate.helpers({
  templateName: function () {
    return template ? template.name : '';
  },
  templateSubject: function () {
    return template ? template.subject : '';
  },
  errorName: function () {
    return errorName.get();
  },
  errorSubject: function () {
    return errorSubject.get();
  },
  categoryTypes: function () {
    return _.map(Enums.emailTemplatesCategories, function (val, key) {
      return {code: val, name: key}
    })
  },
  isCategorySelected: function () {
    return template ? _.contains(template.category, this.code) : false;
  },

  editMode: function () {
    return editMode.get();
  },
  mergeField: function () {
    return EmailTemplateMergeFields.find();
  },
  editorContext: function () {
    return {value: template ? template.text : ''};
  },
  preview: function () {
    return preview.get();
  }
});

Template.emailTemplate.events({
  'change #name-input': function () {
    // Clear error
    errorName.set('');

    var name = Template.instance().$('.templateName').val();
    if (!name) {
      errorName.set('Error, name is required.');
    }
  },
  'change #subject-input': function () {
    // Clear error
    errorSubject.set('');

    var subject = Template.instance().$('.templateSubject').val();
    if (!subject) {
      errorSubject.set('Error, name is required.');
    }
  },

  'click #addMergeField': function () {
    // Get selected merge field
    var selected = Template.instance().$('#mergeFields').val();
    if (!selected) return;

    // Find the corresponding merge field definition
    var mf = EmailTemplateMergeFields.findOne(selected);
    if (!mf) return;

    // Insert the merge field on the editor
    try {
      var editorInstance = Template.instance().$('.editor').data('wysihtml5').editor;
      editorInstance.composer.commands.exec("foo", mf);
    } catch (ex) {
      console.log('Error trying to insert merge field. Try giving the editor focus.');
    }
  },

  'click #preview': function () {
    if (editMode.get()){
      editMode.set(false);
      Meteor.call('getPreview', Template.instance().$('.editor').data('wysihtml5').editor.composer.getValue(), function (err, result) {
        if (err){
          console.log(err);
        }else{
          preview.set(result);
        }
      })
    }else{
      editMode.set(true);
    }
  },
  'click #add': function () {
    // Clear errors
    errorName.set('');
    errorSubject.set('');

    // Check the required properties
    var name = Template.instance().$('.templateName').val();
    var subject = Template.instance().$('.templateSubject').val();
    if (!name || !subject) {
      if (!name) { errorName.set('Error, name is required.'); }
      if (!subject) { errorSubject.set('Error, subject is required.'); }
    } else {

      // Save the template
      var templateData = {
        name: name,
        subject: subject,
        text: Template.instance().$('.editor').data('wysihtml5').editor.composer.getValue(),
        category: Template.instance().$('#category').val()
      };

      if (template) {
        EmailTemplates.update(template._id, {$set: templateData});
      } else {
        var templateId = EmailTemplates.insert(templateData);
        template = EmailTemplates.findOne({_id: templateId});
      }
    }
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