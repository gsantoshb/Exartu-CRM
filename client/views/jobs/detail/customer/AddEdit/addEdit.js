Template.jobCustomerAddEdit.created = function () {
  Meteor.subscribe('allCustomers');
};

Template.jobCustomerAddEdit.viewModel = function (entityId, value, path, collection, callback) {
  if (!entityId) {
    return;
  }

  var self = this;
  self.customer = ko.observable(value);
  self.addOrEdit = value ? 'edit' : 'add';
  self.customers = ko.meteor.find(AllCustomers, {});

  self.add = function () {
    var customer = self.customer();
    if (customer === undefined) {
      customer = null;
    }
    var upd = {};
    upd[path] = customer;

    collection.update({_id: entityId}, {$set: upd}, function (err, result) {
      if (!err) {
        self.close();
        if (callback && _.isFunction(callback)) {
          callback(customer);
        }
      }

      else {
        console.dir(err);
      }
    })
  };
  return self;
};
