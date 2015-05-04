Meteor.publish('singleContactable', function (id) {
    var sub = this;
    ContactablesList.publishCursor(Utils.filterCollectionByUserHier.call(this, ContactablesList.find({_id: id})), sub, 'contactables');
    sub.ready();
});
Meteor.publish('leaderBoardClients', function (q) {
    return Utils.filterCollectionByUserHier.call(this,
            Contactables.find(q));
});

ContactablesList = new View('auxContactables', {
    collection: Contactables,
    cursors: function (contactable) {

        // Placements
        this.publish({
            cursor: function (contactable) {
                if (contactable.placement !== undefined) {
                    return PlacementView.find({_id: contactable.placement});
                }
            },
            to: 'placements',
            observedProperties: ['placement'],
            onChange: function (changedProps, oldSelector) {
                if (changedProps.placement !== undefined) {
                    return PlacementView.find({_id: changedProps.placement});
                }
            }
        });

        // Publish contact's client
        this.publish({
            cursor: function (contactable) {
                if (contactable.Contact && contactable.Contact.client) {
                    return Contactables.find(contactable.Contact.client, {fields: {'organization.organizationName': 1}});
                }
            },
            to: 'contactables',
            observedProperties: ['Contact'],
            onChange: function (changedProps, oldSelector) {
                if (changedProps.Contact.client) {
                    return Contactables.find(changedProps.Contact.client, {fields: {'organization.organizationName': 1}});
                }
            }
        });

        // Publish client's contacts
        this.publish({
            cursor: function (contactable) {
                if (contactable.Client) {
                    return Contactables.find({'Contact.client': contactable._id});
                }
            },
            to: 'contactables'
        });

        // Publish client's jobs
        this.publish({
            cursor: function (contactable) {
                return Jobs.find({client: contactable._id});
            },
            to: 'jobs'
        });

        //// Last note
        //this.publish({
        //    cursor: function (contactable) {
        //        return Notes.find({'links.id': contactable._id}, {limit: 50, sort: {dateCreated: -1}});
        //    },
        //    to: 'notes'
        //});

        this.publish({
            cursor: function (contactable) {
                return HotLists.find({members: contactable._id});
            },
            to: 'hotlists'
        });

    }
});

Meteor.paginatedPublish(ContactablesList, function () {
        if (!this.userId)
            return [];
        return Utils.filterCollectionByUserHier.call(this, ContactablesList.find({},
                {
                    fields: {
                        // Only fields displayed on list
                    },
                    sort: {
                        dateCreated: -1
                    }
                })
        );
    },
    {
        pageSize: 20,
        publicationName: 'auxContactables',
        updateSelector: function (oldSelector, clientParams) {
            var newSelector = EJSON.clone(oldSelector);
            if (clientParams && clientParams.placementStatus) {
                // Get ids of employees that have placements with status equal to clientParams.placementStatus
                newSelector._id = {
                    $in: Placements.find({candidateStatus: {$in: clientParams.placementStatus}}).map(function (placement) {
                        return placement.employee;
                    })
                };
            }

            // Address location filter
            if (clientParams && clientParams.location) {
              // Get the ids of contactables (linkId) that have addresses that matches the criteria
              if (_.isString(clientParams.location)) {
                // Search the text in the most common properties
                newSelector._id = {
                  $in: Addresses.find({$or: [
                    {address: {$regex: clientParams.location, $options: 'i'}},
                    {city: {$regex: clientParams.location, $options: 'i'}},
                    {state: {$regex: clientParams.location, $options: 'i'}},
                    {country: {$regex: clientParams.location, $options: 'i'}}
                  ]}).map(function (address) {
                    return address.linkId;
                  })
                };

              } else {
                // Search as specified
                var query = {$and: []};
                if (clientParams.location.address)
                  query.$and.push({address: {$regex: clientParams.location.address, $options: 'i'}});
                if (clientParams.location.city)
                  query.$and.push({city: {$regex: clientParams.location.city, $options: 'i'}});
                if (clientParams.location.state)
                  query.$and.push({state: {$regex: clientParams.location.state, $options: 'i'}});
                if (clientParams.location.country)
                  query.$and.push({country: {$regex: clientParams.location.country, $options: 'i'}});

                // Check that the AND contains at least 1 element
                if (query.$and.length > 0) {
                  if (query.$and.length == 1) {
                    query = query.$and[0];
                  }

                  newSelector._id = {
                    $in: Addresses.find(query).map(function (address) {
                      return address.linkId;
                    })
                  };
                }
              }
            }

            return newSelector;
        }
    }
);

Meteor.publish('allClients', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({Client: {$exists: true}}, {
        fields: {
            'organization.organizationName': 1,
            'Client.department': 1,
            houseAccount: 1
        }
    })), sub, 'allClients');
    sub.ready();
});
Meteor.publish('allEmployees', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({Employee: {$exists: true}}, {
        fields: {
            'person.lastName': 1,
            'person.middleName': 1,
            'person.firstName': 1,
            'activeStatus': 1
        }
    })), sub, 'allEmployees');
    sub.ready();
});
Meteor.publish('allContactables', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Contactables.find({}, {
        fields: {
            'person.lastName': 1,
            'person.middleName': 1,
            'person.firstName': 1,
            'organization.organizationName': 1,
            'Client.department': 1
        }
    })), sub, 'allContactables');
    sub.ready();
});

Contactables.allow({
    insert: function () {
        return false;
    },
    update: function (userId, doc) {
        return Meteor.user() && methods.getHierarchiesRelation(Meteor.user().currentHierId, doc.hierId) == -1;
    },
    remove: function () {
        return false;
    }
});

// Hooks



Contactables.before.insert(function (userId, doc) {
    try {
        var user = Meteor.user() || {};
    } catch (e) {
        var user = {}
    }
    if (doc.Employee && doc.Employee.taxID) {
        if (!ContactableManager.isTaxIdUnused(doc.Employee.taxID, user.hierId)) {
            throw new Meteor.Error(500, 'TaxId already in use');
            return false;
        }

    }

    doc.hierId = user.currentHierId || doc.hierId;
    doc.userId = user._id || doc.userId;
    doc.dateCreated = Date.now();
    if (!doc.activeStatus) doc.activeStatus = LookUpManager.getActiveStatusDefaultId();
    if (doc.organization) {
        doc.displayName = doc.organization.organizationName;
    }
    ;
    if (doc.person) {
        doc.displayName = doc.person.lastName + ', ' + doc.person.firstName;
    }

});

// Contactables documents

ContactablesFS = new Document.Collection({
    collection: Contactables
});
ContactablesFS.publish();

/** old code **/
/*
 Meteor.publish('contactablesFiles', function () {
 return ContactablesFiles.find();
 });
 */
Meteor.paginatedPublish(ContactablesFiles, function(entityId) {
  return ContactablesFiles.find({entityId: entityId});
}, {
    pageSize: 10,
    publicationName: 'contactablesDocs'
});

ContactablesFiles.before.insert(function(userId,doc){
    doc.dateCreated=Date.now();

});

ContactablesFiles.allow({
    remove: function (userId, file) {
        var user = Meteor.users.findOne({_id: userId});
        return (RoleManager.bUserIsClientAdmin(user) || RoleManager.bUserIsSystemAdmin(user)) ? true : false;
    }
});

// Employee resumes
Resumes = new Mongo.Collection('resumes');
Meteor.publish('resumes', function () {
  return Utils.filterCollectionByUserHier.call(this, Resumes.find({}));
});

Resumes.allow({
  remove: function (userId, file) {
    return (RoleManager.bUserIsClientAdmin() || RoleManager.bUserIsSystemAdmin()) ? true : false;
  }
});



// Indexes

Contactables._ensureIndex({hierId: 1});
Contactables._ensureIndex({'dateCreated': 1});
Contactables._ensureIndex({objNameArray: 1});
Contactables._ensureIndex({'Employee.status': 1});
Contactables._ensureIndex({'Client.status': 1});
Contactables._ensureIndex({'Contact.status': 1});
Contactables._ensureIndex({'activeStatus': 1});
Contactables._ensureIndex({userId: 1});
