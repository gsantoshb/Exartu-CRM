
ContactablesView = new Mongo.Collection('contactablesView');

Meteor.paginatedPublish(ContactablesView, function () {
        if (!this.userId)
            return [];
        return Utils.filterCollectionByUserHier.call(this, ContactablesView.find({},
                {
                    fields: {
                        location: 0
                    },
                    sort: {
                        dateCreated: -1
                    }
                })
        );
    },
    {
        pageSize: 20,
        publicationName: 'contactablesView'
    }
);


// Indexes
ContactablesView._ensureIndex({hierId: 1});
ContactablesView._ensureIndex({'dateCreated': 1});
ContactablesView._ensureIndex({objNameArray: 1});
ContactablesView._ensureIndex({'Employee.status': 1});
ContactablesView._ensureIndex({'Client.status': 1});
ContactablesView._ensureIndex({'Contact.status': 1});
ContactablesView._ensureIndex({'activeStatus': 1});
ContactablesView._ensureIndex({userId: 1});
