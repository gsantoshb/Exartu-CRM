"use strict";
Meteor.publish('deals', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Deals.find({
        hierId: user.hierId
    });
})

Deals.allow({
    update: function () {
        return true;
    },
    insert: function () {
        return true;
    }
});

Deals.before.insert(function (userId, doc) {
    var user = Meteor.user();
//    var dealType=methods.getObjTypesFromObject(doc)[0];
//    var dealTypeObj=doc[dealType.objName];
//    doc.displayName = dealTypeObj.Deal_Name;
    doc.hierId = user.hierId;
    doc.userId = user._id;
    doc.createdAt = Date.now();
});

Meteor.startup(function () {
    Meteor.methods({
        addDeal: function (deal) {
            if (beforeInsertOrUpdateDeal(deal)) {
                Deals.insert(deal);
            } else {
                console.error('Deal is not valid')
                console.dir(deal);
            }
        }
    });
});

/*
 * extends and validate a deal before inserting or updating
 */
var beforeInsertOrUpdateDeal = function (deal) {
    var user = Meteor.user();
    if (user == null)
    {
        throw new Meteor.Error(401, "Please login");
    }
    return true;
};

/*
 * extend a deal with assignments, candidates and the services defined in objTypes
 * objTypes must be an array with the object's types that the deal references
 */
var extendDeal = function (deal, objTypes) {
    _.forEach(objTypes, function (objType) {
        _.forEach(objType.services, function (service) {
            if (deal[service] == undefined)
                deal[service] = [];
        });
    });
}

/*
 * validate a deal
 * objTypes must be an array with the object's types that the deal references
 */
var validate = function (deal, objTypes) {
    var v = true;
    _.every(objTypes, function (objType) {
        v = validateObjType(deal, objType);
        return v;
    });

    return v;
};