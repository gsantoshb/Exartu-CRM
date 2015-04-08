
var options;
Template.basicSelectModal.created = function() {
  options = _.first(this.data) || { title: '', placeholder: '', value: ''};
};

Template.basicSelectModal.rendered = function () {
  Template.instance().$('select').select2({
    placeholder: options.placeholder
  });
};

var selectedValue = '';
Template.basicSelectModal.helpers({
  title: function () {
    return options.title;
  },
  selectOptions: function () {
    return options.selectOptions || [];
  },
  selectPlaceholder: function () {
    return options.placeholder || '';
  },
  cancelText: function () {
    return options.cancelText || 'Cancel';
  },
  acceptText: function () {
    return options.acceptText || 'Okay';
  },
  setValue: function () {
    return function (value) {
      selectedValue = value;
    }
  }
});

Template.basicSelectModal.events({
  'click .accept': function () {
    if(options.callback)
      options.callback(selectedValue);

    Utils.dismissModal();
  },
  'click .dismiss': function () {
    Utils.dismissModal();
  }
});
