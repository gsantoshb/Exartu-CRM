var options;
Template.basicInputModal.created = function() {
  options = _.first(this.data) || { title: '', placeholder: '', value: ''};
};

Template.basicInputModal.helpers({
  title: function () {
    return options.title;
  },
  placeholder: function () {
    return options.placeholder;
  },
  value: function () {
    return options.value;
  },
  cancelText: function () {
    return options.cancelText || 'Cancel';
  },
  acceptText: function () {
    return options.acceptText || 'Okay';
  }
});

Template.basicInputModal.events({
  'click .accept': function () {
    var value = Template.instance().$('input').val();
    if(options.callback) {
      options.callback(value);
    }

    Utils.dismissModal();
  },
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});