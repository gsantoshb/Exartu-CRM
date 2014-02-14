Meteor.publish('deals', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Deals.find({
        $or: filterByHiers(user.hierId)
    });
});

Deals.allow({
    insert: function () {
        return true;
    },
    update: function () {
        return true;
    }
})

Deals.before.insert(function (userId, doc) {
    var user = Meteor.user();
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
                console.error('Deal not valid')
                console.dir(deal);
            }
        },
        updateDeal: function (deal) {
            if (beforeInsertOrUpdateDeal(deal)) {
                Deals.update({
                    _id: deal._id
                }, deal);
            } else {
                console.error('Deal not valid')
                console.dir(deal);
            }
        },
        addDealTag: function (dealId, tag) {
            // TODO: validations

            Deals.update({
                _id: dealId
            }, {
                $addToSet: {
                    tags: tag
                }
            });
        },
        addDealPost: function (dealId, post) {
            // TODO: validations
            post.userId = Meteor.userId();
            post.createdAt = Date.now();
            Deals.update({
                _id: dealId
            }, {
                $addToSet: {
                    posts: post
                }
            });
        },
        addDealQuote: function (dealId, quote) {
            // TODO: validations
            quote.userId = Meteor.userId();
            quote.createdAt = Date.now();
            Deals.update({
                _id: dealId
            }, {
                $addToSet: {
                    quotes: quote
                }
            });
        }
    });
});

/*
 * logic that is common to add and update a deal (extend and validate)
 */
var beforeInsertOrUpdateDeal = function (deal) {
    var user = Meteor.user();
    if (user == null)
        throw new Meteor.Error(401, "Please login");

    if (!deal.objNameArray || !deal.objNameArray.length) {
        console.error('the deal must have at least one objName');
        throw new Meteor.Error(401, "invalid deal");
    }
    var objTypes = ObjTypes.find({
        objName: {
            $in: deal.objNameArray
        }
    }).fetch();

    if (objTypes.length != deal.objNameArray.length) {
        console.error('the deal objNameArray is suspicious');
        console.dir(deal.objNameArray);
        throw new Meteor.Error(401, "invalid objNameArray");
    }
    extendDeal(deal, objTypes)

    return Validate(deal, objTypes)
}
/*
 * extend the deal object with the contact methods and the services needed
 * objTypes must be an array with the object's types that the deal references
 */
var extendDeal = function (deal, objTypes) {
    if (!deal.contactMethods)
        deal.contactMethods = [];

    _.forEach(objTypes, function (objType) {
        if (objType) {
            _.forEach(objType.services, function (service) {
                if (deal[service] == undefined)
                    deal[service] = [];
            });
        }
    })
};

/*
 * validate that the deal is valid for the objTypes passed
 * objTypes must be an array with the object's types that the deal references
 */
var Validate = function (deal, objTypes) {

    if (!validateDeal(deal)) {
        return false;
    }
    var v = true;
    _.every(objTypes, function (objType) {
        v = v && validateObjType(deal, objType);
        return v;
    });
    return v;
};


var validateDeal = function (obj) {
    return true;
};

