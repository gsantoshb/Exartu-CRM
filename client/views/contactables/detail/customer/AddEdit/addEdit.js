var customer = null,
  value, entityId, callback;

Template.contactCustomerAddEdit.created = function () {
  entityId = this.data[0];
  value = this.data[1];
  callback = this.data[2];
};
Template.contactCustomerAddEdit.helpers({
  addOrEdit: function () {
    return value ? 'edit' : 'add';
  }
});

Template.contactCustomerAddEdit.events({
  'click .add': function () {
    //var customer = self.customer();
    if (customer === undefined) {
      customer = null;
    }

    Meteor.call('setContactCustomer', entityId, customer, function (err, result) {
      if (!err) {
        // Set as last customer used
        Utils.dismissModal();

        if (callback && _.isFunction(callback)) {
          callback(customer);
        }
      } else {
        console.dir(err);
      }
    })
  }
});

Template.contactCustomerAddEdit.getCustomer = function () {
  return function (string) {
    var self = this;

    Meteor.call('findCustomer', string, function (err, result) {
      if (err)
        return console.log(err);

      self.ready(_.map(result, function (r) {
          return { id: r._id, text: r.organization.organizationName };
        })
      );
    });
  };
};

Template.contactCustomerAddEdit.customerChanged = function () {
  return function (value) {
    customer = value;
  }
};