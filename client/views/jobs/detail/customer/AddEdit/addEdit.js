var client = null,
  value, entityId, callback;

Template.jobClientAddEdit.created = function () {
  entityId = this.data[0];
  value = this.data[1];
  callback = this.data[2];
};
Template.jobClientAddEdit.helpers({
  addOrEdit: function () {
    return value ? 'edit' : 'add';
  }
});
Template.jobClientAddEdit.events({
  'click .add': function () {
    //var client = self.client();
    if (client === undefined) {
      client = null;
    }

    Meteor.call('setJobClient', entityId, client, function (err, result) {
      if (!err) {
        // Set as last client used
        Meteor.call('setLastUsed', Enums.lastUsedType.client, client);

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

Template.jobClientAddEdit.getClient = function () {
  return function (string) {
    var self = this;

    if (_.isEmpty(string)) {
      // Get last five client used
      Meteor.call('getLastUsed', Enums.lastUsedType.client, function (err, result) {
        if (err)
          return console.log(err);


        self.ready(_.map(result, function (client) {
            return { id: client._id, text: client.organization.organizationName };
          })
        );
      });
    } else {
      Meteor.call('findClient', string, function (err, result) {
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

Template.jobClientAddEdit.clientChanged = function () {

  return function (value) {
    client = value;
  }
}