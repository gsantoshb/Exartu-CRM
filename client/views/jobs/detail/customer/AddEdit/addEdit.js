var customer = ko.observable();
Template.jobCustomerAddEdit.viewModel = function (entityId, value, path, collection, callback) {
  if (!entityId) {
    return;
  }

  var self = this;
  customer(value);
  self.customer = customer;
  self.addOrEdit = value ? 'edit' : 'add';
  self.customers = ko.meteor.find(AllCustomers, {});

  self.add = function () {
    var customer = self.customer();
    if (customer === undefined) {
      customer = null;
    }

    Meteor.call('setJobCustomer', entityId, customer, function (err, result) {
      if (!err) {
        // Set as last customer used
        Meteor.call('setLastUsed', Enums.lastUsedType.customer, customer);

        self.close();
        if (callback && _.isFunction(callback)) {
          callback(customer);
        }
      } else {
        console.dir(err);
      }
    })
  };
  return self;
};

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
    customer(value);
  }
}