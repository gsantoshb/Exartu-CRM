var customer = null,
  value, entityId, callback;

Template.jobCustomerAddEdit.created = function () {
  entityId = this.data[0];
  value = this.data[1];
  callback = this.data[2];
};
Template.jobCustomerAddEdit.helpers({
  addOrEdit: function () {
    return value ? 'edit' : 'add';
  }
});
Template.jobCustomerAddEdit.events({
  'click .add': function () {
    //var customer = self.customer();
    if (customer === undefined) {
      customer = null;
    }

    Meteor.call('setJobCustomer', entityId, customer, function (err, result) {
      if (!err) {
        // Set as last customer used
        Meteor.call('setLastUsed', Enums.lastUsedType.customer, customer);

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

Template.jobCustomerAddEdit.getCustomer = function () {
  return function (string) {
    var self = this;

    if (_.isEmpty(string)) {
      // Get last five customer used
      Meteor.call('getLastUsed', Enums.lastUsedType.customer, function (err, result) {
        if (err)
          return console.log(err);


        self.ready(_.map(result, function (customer) {
            return { id: customer._id, text: customer.organization.organizationName };
          })
        );
      });
    } else {
      Meteor.call('findCustomer', string, function (err, result) {
        if (err)
          return console.log(err);

        self.ready(_.map(result, function (r) {
            return { id: r._id, text: r.organization.organizationName };
          })
        );
      });
    }
  };
};

Template.jobCustomerAddEdit.customerChanged = function () {

  return function (value) {
    customer = value;
  }
}