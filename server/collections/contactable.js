Meteor.publish('contactables', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Contactables.find({
        $or: filterByHiers(user.hierId)
    });
});

Contactables.allow({
    insert: function (userId, doc) {
        return false;
    },
    update: function (userId, doc, fields, modifier) {
        console.log('update contacatable: ' + methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId));
        return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().hierId, doc.hierId) == -1;
    },
    remove: function (userId, doc) {
        return false;
    }
})

Contactables.before.insert(function (userId, doc) {
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
    doc.createdAt = Date.now();
});


// Contactables files
ContactablesFS = new CollectionFS('contactables');
Meteor.publish('contactableFiles', function () {
    return ContactablesFS.find({});
});

ContactablesFS.allow({
    insert: function (userId, file) {
        return true;
    },
    update: function (userId, file, fields, modifier) {
        return true;
    },
    remove: function (userId, file) {
        return true; // TODO: allow correctly
    }
});

var handler = {
    default: function (options) {
        return {
            blob: options.blob,
            fileRecord: options.fileRecord
        };
    },
}
ContactablesFS.fileHandlers(handler);

Meteor.startup(function () {
    Meteor.methods({
        addContactable: function (contactable) {
            contactable._id=new Meteor.Collection.ObjectID()._str;
            if (beforeInsertOrUpdateContactable(contactable)) {
                Contactables.insert(contactable);
            } else {
                console.error('Contactable not valid')
                console.dir(contactable);
            }
        },
        updateContactable: function (contactable) {
            if (beforeInsertOrUpdateContactable(contactable)) {
                Contactables.update({
                    _id: contactable._id
                }, contactable);
            } else {
                console.error('Contactable not valid')
                console.dir(contactable);
            }
        },
        addContactableTag: function (contactableId, tag) {
            // TODO: validations

            Contactables.update({
                _id: contactableId
            }, {
                $addToSet: {
                    tags: tag
                }
            });
        },
        removeContactableTag: function (contactableId, tag) {
            // TODO: validations

            Contactables.update({
                _id: contactableId
            }, {
                $pull: {
                    "tags": tag
                }
            });
        },
        addContactableContactMethod: function (contactableId, contactMethod) {
            // TODO: validations

            Contactables.update({
                _id: contactableId
            }, {
                $addToSet: {
                    contactMethods: contactMethod
                }
            });
        },
        addContactablePost: function (contactableId, post) {
            // TODO: validations
            post.userId = Meteor.userId();
            post.createdAt = Date.now();

            console.log('New post ');
            console.dir(post);

            Contactables.update({
                _id: contactableId
            }, {
                $addToSet: {
                    posts: post
                }
            });
        },
        updateContactablePicture: function (contactableId, fileId) {
            console.log("contactalbe picture updated");
            Contactables.update({
                _id: contactableId
            }, {
                $set: {
                    pictureFileId: fileId
                }
            });
        },
        createCandidate: function(candidate, jobId) {
          candidate.cratedAt = new Date();
          candidate.negotiation = '';
          Jobs.update({
            _id: jobId
          }, {
            $addToSet: {
              candidates: candidate
            }
          });
        }
    });
});

/*
 * logic that is common to add and update a contactable (extend and validate)
 */
var beforeInsertOrUpdateContactable = function (contactable) {
    var user = Meteor.user();
    if (user == null)
        throw new Meteor.Error(401, "Please login");

    if (!contactable.objNameArray || !contactable.objNameArray.length) {
        console.error('the contactable must have at least one objName');
        throw new Meteor.Error(401, "invalid contactable");
    }
    var objTypes = ObjTypes.find({
        objName: {
            $in: contactable.objNameArray
        }
    }).fetch();

    if (objTypes.length != contactable.objNameArray.length) {
        console.error('the contactable objNameArray is suspicious');
        console.dir(contactable.objNameArray);
        throw new Meteor.Error(401, "invalid objNameArray");
    }
    extendContactable(contactable, objTypes)

    return Validate(contactable, objTypes)
}
/*
 * extend the contactable object with the contact methods and the services needed
 * objTypes must be an array with the object's types that the contactable references
 */
var extendContactable = function (contactable, objTypes) {
    if (!contactable.contactMethods)
        contactable.contactMethods = [];

    _.forEach(objTypes, function (objType) {
        if (objType) {
            _.forEach(objType.services, function (service) {
                if (contactable[service] == undefined)
                    contactable[service] = [];
            });
        }
    })
};

/*
 * validate that the contactable is valid for the objTypes passed
 * objTypes must be an array with the object's types that the contactable references
 */
var Validate = function (contactable, objTypes) {

    if (!validateContactable(contactable)) {
        return false;
    }
    var v = true;
    _.every(objTypes, function (objType) {
        v = v && validateObjType(contactable, objType);
        return v;
    });
    return v;
};

/*
 * validate that the contactable is a valid person or a valid org
 */
var validateContactable = function (obj) {
    if (!obj.person & !obj.organization) {
        console.error('the contactable must be a person or an organization');
        return false
    }
    if (obj.person && (!validatePerson(obj.person))) {
        console.error('invalid person');
        return false;
    }
    if (obj.organization && (!validateOrganization(obj.organization))) {
        console.error('invalid Organization');
        return false;
    }
    return true;
};

var validatePerson = function (person) {
    if (!person.firstName)
        return false;
    if (!person.lastName)
        return false;
    return true;
};

var validateOrganization = function (org) {
    if (!org.organizationName)
        return false;
    return true;
}

// indexes
Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({objNameArray: 1});