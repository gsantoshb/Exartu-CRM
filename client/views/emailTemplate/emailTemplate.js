
var template;
EmailTemplateController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  waitOn: function () {
    return [Meteor.subscribe('emailTemplateMergeFields'), Meteor.subscribe('emailTemplates')];
  },
  action: function () {
    if (this.params._id) {
      template = EmailTemplates.findOne({_id: this.params._id});
    } else {
      template = {};
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
    errorSubject = new ReactiveVar(''),
    isSaving = new ReactiveVar(false);

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
    return template ? template.text : '';
  },
  preview: function () {
    return preview.get();
  },
  isSaving: function () {
    return isSaving.get();
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
      var html = '<input value="' + mf.displayName + '" data-mergefield="' + mf._id + '" disabled="disabled">';
      WYSIHTMLEditor.composer.commands.exec("insertHTML", html);
    } catch (ex) {
      console.log('Error trying to insert merge field. Try giving the editor focus.');
    }
  },

  'click #preview': function () {
    if (editMode.get()){
      editMode.set(false);
      var editorText = WYSIHTMLEditor.getValue();
      Meteor.call('getPreview', editorText, function (err, result) {
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
    isSaving.set(true);

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
        text: WYSIHTMLEditor.getValue(),
        category: Template.instance().$('#category').val()
      };

      if (template) {
        EmailTemplates.update(template._id, {$set: templateData});
      } else {
        var templateId = EmailTemplates.insert(templateData);
        template = EmailTemplates.findOne({_id: templateId});
      }
    }

    isSaving.set(false);
  }
});
