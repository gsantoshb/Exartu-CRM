var client = null,
  value, entityId, callback;

Template.contactClientAddEdit.created = function () {
  entityId = this.data[0];
  value = this.data[1];
  callback = this.data[2];
};
Template.contactClientAddEdit.helpers({
  addOrEdit: function () {
    return value ? 'edit' : 'add';
  }
});

Template.contactClientAddEdit.events({
  'click .add': function () {
    //var client = self.client();
    if (client === undefined) {
      client = null;
    }

    Meteor.call('setContactClient', entityId, client, function (err, result) {
      if (!err) {
        // Set as last client used
        Utils.dismissModal();

        if (callback && _.isFunction(callback)) {
          callback(client);
        }
      } else {
        console.dir(err);
      }
    })
  }
});

Template.contactClientAddEdit.getClient = function () {
  return function (string) {
    var self = this;

    Meteor.call('findClient', string, function (err, result) {
      if (err)
        return console.log(err);

      self.ready(_.map(result, function (r) {
          return { id: r._id, text: r.organization.organizationName };
        })
      );
    });
  };
};

Template.contactClientAddEdit.clientChanged = function () {
  return function (value) {
    client = value;
  }
};