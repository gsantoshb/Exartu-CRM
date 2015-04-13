var member = null,
    entity, entityId, callback;

Template.hotListMemberAdd.created = function () {
    entity = this.data[0];
    entityId = entity._id;
    callback = this.data[1];
};
Template.hotListMemberAdd.helpers({
    getMember: function () {
        return function (string) {
            var self = this;

            switch (entity.category){
                case MergeFieldHelper.categories.employee.value:

                    Meteor.call('findEmployee', string, function (err, result) {
                        if (err)
                            return console.log(err);

                        self.ready(_.map(result, function (r) {
                              if(r.person)
                                  return { id: r._id, text: r.person.firstName+', '+r.person.lastName };
                              if(r.organization)
                                  return { id: r._id, text: r.organization.organizationName };
                          })
                        );
                    });
                    break;

                case MergeFieldHelper.categories.client.value:

                    Meteor.call('findClient', string, function (err, result) {
                        if (err)
                            return console.log(err);

                        self.ready(_.map(result, function (r) {
                              if(r.person)
                                  return { id: r._id, text: r.person.firstName+', '+r.person.lastName };
                              if(r.organization)
                                  return { id: r._id, text: r.organization.organizationName };
                          })
                        );
                    });
                    break;

                case MergeFieldHelper.categories.contact.value:

                    Meteor.call('findContact', string, function (err, result) {
                        if (err)
                            return console.log(err);

                        self.ready(_.map(result, function (r) {
                              if(r.person)
                                  return { id: r._id, text: r.person.firstName+', '+r.person.lastName };
                              if(r.organization)
                                  return { id: r._id, text: r.organization.organizationName };
                          })
                        );
                    });
                    break;
            }
        };
    },
    memberChanged: function () {
        return function (value) {
            member = value;
        }
    },
    category: function () {
        switch (entity.category){
            case MergeFieldHelper.categories.employee.value:
               return MergeFieldHelper.categories.employee.name;

            case MergeFieldHelper.categories.client.value:
                return MergeFieldHelper.categories.employee.name;


            case MergeFieldHelper.categories.contact.value:
                return MergeFieldHelper.categories.employee.name;

        }
    }
});

Template.hotListMemberAdd.events({
    'click .add': function () {
        if (member === undefined) {
            member = null;
        }

        if (callback && _.isFunction(callback)) {
            callback(member, entityId);
        }

        Utils.dismissModal();
    }
});