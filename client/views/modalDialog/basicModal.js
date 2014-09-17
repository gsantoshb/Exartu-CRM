var options;
Template.basicModal.created = function() {
  options = _.first(this.data) || { title: '', message: ''};
};

Template.basicModal.helpers({
  title: function () {
    return options.title;
  },
  message: function () {
    return options.message;
  },
  buttons: function () {
    return options.buttons || [{ label: 'Okay', classes: 'btn-default'}];
  }
});

Template.basicModal.events({
  'click .btn': function () {
    Utils.dismissModal();
    if(options.callback) {
      options.callback(this.value);
    }
  },
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});