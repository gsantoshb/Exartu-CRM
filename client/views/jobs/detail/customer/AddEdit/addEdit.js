Template.jobCustomerAddEdit.viewModel = function(entityId, value, path, collection) {
  if (!entityId) {
    return;
  }

  var self = this;
  self.customer= ko.observable(value)
  self.addOrEdit= value ? 'edit': 'add';
  self.customers= ko.meteor.find(Contactables,{ Customer: { $exists: true } });

  self.add = function () {
    var customer=self.customer();
    if (customer === undefined){
        customer= null;
    }
    var upd={};
    upd[path]=customer;
    collection.update({ _id: entityId },{ $set: upd }, function(err, result){
      if(!err)
          self.close();
      else{
          console.dir(err);
      }
    })
  }
  return self;
}
