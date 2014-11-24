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

    Meteor.call('setCustomer', entityId, customer, function (err, result) {
      if (!err) {
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

Template.jobCustomerAddEdit.customerChanged = function () {

  return function (value) {
    customer(value);
  }
}