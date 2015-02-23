LookUpManager={
    getActiveStatusDefaultId: function(user) {
        if (!user)
        {
            try {
                var user = Meteor.user() || {};
            } catch (e) {
                var user = Meteor.users.findOne({_id: this.userId})
            }
        }
        var lkp=LookUps.find({ hierId: user.currentHierId, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode ,isDefault:true}).fetch();
        if (!lkp) lkp=LookUps.find({ hierId: user.currentHierId, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode }).fetch();
        return lkp._id;
    },
    ContactMethodTypes_Email: function () {
        var user = Meteor.user() || {};
        return LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            hierId: user.currentHierId, lookUpActions: "ContactMethod_Email"});
    },
    ContactMethodTypes_MobilePhone: function () {
        var user = Meteor.user() || {};
        return LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            hierId: user.currentHierId, lookUpActions: "ContactMethod_MobilePhone"});
    },
    ContactMethodTypes_OfficePhone: function () {
        var user = Meteor.user() || {};
        return LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
            hierId: user.currentHierId, lookUpActions: "ContactMethod_OfficePhone"
        });
    },
    getAddressTypeDefaultId: function() {
        return LookUps.findOne({
            lookUpCode: Enums.lookUpTypes.linkedAddress.type.lookUpCode,
            isDefault: true,
            hierId: Meteor.user().currentHierId
        })._id;
    },
};