seedSystemLookUps = function () {
    systemLookUps = [{
        name: 'jobTitle',
        objGroupType: Enums.objGroupType.job,
        items: [{
            displayName: 'Developer',
            code: 0
                }, {
            displayName: 'Designer',
            code: 1
            }],
        }, {
        name: 'jobStatus',
        objGroupType: Enums.objGroupType.job,
        items: [{
            displayName: 'open',
            code: 0
                }, {
            displayName: 'close',
            code: 1
            }, {
            displayName: 'unfilled',
            code: 2
            }, {
            displayName: 'filled',
            code: 3
            }],
        }, {
        name: 'jobDuration',
        objGroupType: Enums.objGroupType.job,
        items: [{
            displayName: 'Permanent',
            code: 0
                }, {
            displayName: 'Journal',
            code: 1
            }],
        }, {
        name: 'jobCategory',
        objGroupType: Enums.objGroupType.job,
        items: [{
            displayName: 'SoftwareDeveloper',
            code: 0
                }, {
            displayName: 'WebDesigner',
            code: 1
            }],
        }, {
        name: 'jobIndustry',
        objGroupType: Enums.objGroupType.job,
        items: [{
            displayName: 'Finance',
            code: 0
                }, {
            displayName: 'Software',
            code: 1
            }],
        }, {
        name: 'employeeStatuses',
        objGroupType: Enums.objGroupType.contactables,
        items: [{
            displayName: 'Invited',
            weigth: 2,
            code: 0
                }, {
            displayName: 'Recruited',
            weigth: 3,
            code: 1,
            dependencies: [0],
        }],
    }];


    _.forEach(systemLookUps, function (lu) {

        var oldLU = LookUps.findOne({
            'name': lu.name,
            'objGroupType': lu.objGroupType
        });
        if (oldLU == null) {
            lu.hierId = ExartuConfig.SystemHierarchyId;
            //console.log('inserting lookup ' + lu.name);
            LookUps.insert(lu);
        } else {
            //console.log('updating ' + lu.name);
            Relations.update({
                _id: oldLU._id
            }, {
                $set: {
                    items: lu.items,
                }
            })
        }
    });
}