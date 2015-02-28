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

Placements.before.insert(function (userId, doc) {
    try {
        var user = Meteor.user() || {};
    } catch (e) {
        //when the insert is trigger from the server
        var user = {}
    }
    doc.hierId = user.currentHierId || doc.hierId;
    doc.userId = user._id || doc.userId;
    doc.dateCreated = Date.now();
    if (!doc.activeStatus) doc.activeStatus = LookUpManager.getActiveStatusDefaultId();
    if (doc.job) {
        var job = Jobs.findOne(doc.job);
        if (job) doc.jobDisplayName = job.displayName;
    }
    ;
    if (doc.employee) {
        var emp = Contactables.findOne(doc.employee);
        if (emp) doc.employeeDisplayName = emp.displayName;
    }
    doc.displayName=doc.employeeDisplayName + ' ' + doc.jobDisplayName;

});


Placements.after.insert(function (userId, doc) {
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            placement: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            placement: doc._id
        }
    });
});

Placements.after.update(function (userId, doc) {
    if (doc.employee != this.previous.employee) {

        Contactables.update({
            _id: this.previous.employee
        }, {
            $set: {
                placement: null
            }
        });

        Contactables.update({
            _id: doc.employee
        }, {
            $set: {
                placement: doc._id
            }
        });
    }

});


// add some employee fields for placement sorting
Placements.before.insert(function (userId, doc) {
    var employee = doc.employee && Contactables.findOne(doc.employee);
    if (employee) {
        doc.employeeInfo = {
            firstName: employee.person.firstName,
            lastName: employee.person.lastName,
            middleName: employee.person.middleName
        }
    }
});
Placements.after.update(function (userId, doc) {
    if (doc.employee != this.previous.employee) {

        var employee = doc.employee && Contactables.findOne(doc.employee);
        if (employee) {
            var employeeInfo = {
                firstName: employee.person.firstName,
                lastName: employee.person.lastName,
                middleName: employee.person.middleName
            };
            Placements.update({
                _id: doc._id
            }, {
                $set: {employeeInfo: employeeInfo}
            });
        }
    }
});
Placements._ensureIndex({dateCreated: 1});
Placements._ensureIndex({activeStatus: 1});
Placements._ensureIndex({userId: 1});
Placements._ensureIndex({hierId: 1});
Placements._ensureIndex({objNameArray: 1});
Placements._ensureIndex({candidateStatus: 1});