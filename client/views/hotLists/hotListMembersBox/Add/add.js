var member = null,
    entityId, callback;

Template.hotListMemberAdd.created = function () {
    entityId = this.data[0];
    callback = this.data[1];
    console.log(callback);
};
Template.hotListMemberAdd.helpers({});

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

Template.hotListMemberAdd.getMember = function () {
    return function (string) {
        var self = this;

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
    };
};

Template.hotListMemberAdd.memberChanged = function () {
    return function (value) {
        member = value;
    }
};