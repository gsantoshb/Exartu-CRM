PlacementView = new View('placements', {
    collection: Placements,
    cursors: function (placement) {
        // Job with Client
        this.publish({
            cursor: function (placement) {
                if (placement.job)
                    return JobPlacementView.find(placement.job);
            },
            to: 'jobs',
            observedProperties: ['job'],
            onChange: function (changedProps, oldSelector) {
                return JobPlacementView.find(changedProps.job);
            }
        });

        // Employee
        this.publish({
            cursor: function (placement) {
                if (placement.employee) {
                    return Contactables.find(placement.employee);
                }
            },
            to: 'contactables',
            observedProperties: ['employee'],
            onChange: function (changedProps, oldSelector) {
                return Contactables.find(changedProps.employee);
            }
        });
    }
});
Meteor.paginatedPublish(PlacementView, function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return [];
    return Utils.filterCollectionByUserHier.call(this, PlacementView.find());
}, {
    pageSize: 25,
    publicationName: 'placements'

});

Meteor.publish('placementDetails', function (id) {
    return Utils.filterCollectionByUserHier.call(this, PlacementView.find(id));
});

Meteor.publish('allPlacements', function () {
    var sub = this;
    Meteor.Collection._publishCursor(Utils.filterCollectionByUserHier.call(this, Placements.find({}, {
        fields: {
            status: 1,
            employee: 1,
            job: 1,
            candidateStatus: 1
        }
    })), sub, 'allPlacements');
    sub.ready();
});

Placements.allow({
    insert: function () {
        return true;
    },
    update: function () {
        return true;
    }
});


// Indexes
Placements._ensureIndex({dateCreated: 1});
Placements._ensureIndex({activeStatus: 1});
Placements._ensureIndex({userId: 1});
Placements._ensureIndex({hierId: 1});
Placements._ensureIndex({objNameArray: 1});
Placements._ensureIndex({candidateStatus: 1});
Placements._ensureIndex({displayName: 1});