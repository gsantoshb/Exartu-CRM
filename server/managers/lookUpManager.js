LookUpManager={
    getActiveStatusDefault: function() {
        var user = Meteor.user() || {};
        var lkp=LookUps.find({ hierId: user.currentHierId, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode ,isDefault:true}).fetch();
        if (!lkp) lkp=LookUps.find({ hierId: doc.hierId, lookUpCode: Enums.lookUpTypes.active.status.lookUpCode }).fetch();
        return lkp._id;
    }
}