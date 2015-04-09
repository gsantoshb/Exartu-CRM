
var options;
var templateId = new ReactiveVar('');
Template.sendEmailTemplateModal.created = function() {
  // Get modal options
  options = _.first(this.data) || { categories: [] };
  this.subscribe('categoryEmailTemplates', options.categories);
  templateId.set('');
};

Template.sendEmailTemplateModal.helpers({
  selectOptions: function () {
    return _.map(CategoryEmailTemplates.find().fetch(), function (template) {
      return {text: template.name, id: template._id};
    });
  },
  selectPlaceholder: function () {
    return 'Select a template';
  },
  setValue: function () {
    return function (value) {
      // Clear and set the value of the selected template, as a hack to re-render the HTML editor
      templateId.set('');
      Meteor.setTimeout(function () {
        templateId.set(value);
      }, 100);
    }
  },
  templateId: function () {
    return templateId.get();
  },
  editorContext: function () {
    if (templateId.get())
      return CategoryEmailTemplates.findOne({_id: templateId.get()}).text;
    return '';
  }
});

Template.sendEmailTemplateModal.events({
  'click .accept': function () {
    if(options.callback) {
      // Return the template text when selected
      if (templateId.get()) {
        options.callback({templateId: templateId.get(), text: WYSIHTMLEditor.getValue()});
      } else {
        options.callback('');
      }
    }

    Utils.dismissModal();
  },
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});
