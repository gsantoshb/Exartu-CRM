
var options;
var rendering = new ReactiveVar(false);
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
      rendering.set(true);
      Meteor.setTimeout(function () {
        templateId.set(value);
        rendering.set(false);
      }, 100);
    }
  },
  notRendering: function(){
    return !rendering.get();
  },
  templateId: function () {
    return templateId.get();
  },
  editorContext: function () {
    if (templateId.get()) {
      return CategoryEmailTemplates.findOne({_id: templateId.get()}).text;
    }
    else {
      return ''
    };
  },
  subject: function(){
    if(templateId.get()){
      return CategoryEmailTemplates.findOne({_id: templateId.get()}).subject;
    }
  }
});

Template.sendEmailTemplateModal.events({
  'click .accept': function () {

    var subject = $("#subject-box")[0].value;
    if(options.callback) {
      // Return the template text when selected
      if (templateId.get()) {
        options.callback({subject: subject, templateId: templateId.get(), text: WYSIHTMLEditor.getValue()});
      } else {
        options.callback({subject: subject, text: WYSIHTMLEditor.getValue()});
      }
    }

    Utils.dismissModal();
  },
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});
