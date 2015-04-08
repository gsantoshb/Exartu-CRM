
var template, category;
EmailTemplateController = RouteController.extend({
  layoutTemplate: 'mainLayout',
  template: 'emailTemplate',
  waitOn: function () {
    return [Meteor.subscribe('emailTemplates')];
  },
  action: function () {
    // Init values depending on the available router data
    if (this.params._id) {
      template = EmailTemplates.findOne({_id: this.params._id});
      category = template.category;
    } else {
      template = undefined;
      category = this.params.category;
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
};


var editMode = new ReactiveVar(true),
    preview = new ReactiveVar(''),
    errorName = new ReactiveVar(''),
    errorSubject = new ReactiveVar(''),
    isSaving = new ReactiveVar(false);

Template.emailTemplate.helpers({
  categoryName: function () {
    return _.find(MergeFieldHelper.categories, function(cat) { return cat.value == category }).name;
  },
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

  editMode: function () {
    return editMode.get();
  },
  mergeFields: function () {
    return _.map(MergeFieldHelper.getMergeFields(category), function (mf) {
      return {name: mf.displayName, value: mf.key};
    });
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
    var mf = _.find(MergeFieldHelper.mergeFields, function (mf) {return mf.key === selected});
    if (!mf) return;

    // Insert the merge field on the editor
    try {
      var html = '<input value="' + mf.displayName + '" data-mergefield="' + mf.key + '" disabled="disabled">';
      WYSIHTMLEditor.composer.commands.exec("insertHTML", html);
    } catch (ex) {
      console.log('Error trying to insert merge field. Try giving the editor focus.');
    }
  },

  'click #preview': function () {
    if (editMode.get()){
      editMode.set(false);
      var editorText = WYSIHTMLEditor.getValue();
      preview.set(MergeFieldHelper.getPreview(editorText));
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
        category: category
      };

      if (template) {
        EmailTemplates.update(template._id, {$set: templateData});
      } else {
        var templateId = EmailTemplates.insert(templateData);
        Router.go('/emailTemplate/' + templateId);
      }
      $.gritter.add({
        title:	'Template saved',
        text:	'Your changes have been saved for this template.',
        image: 	'/img/logo.png',
        sticky: false,
        time: 2000
      });
    }

    isSaving.set(false);
  }
});
