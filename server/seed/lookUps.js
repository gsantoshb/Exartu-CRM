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
        }];


    _.forEach(systemLookUps, function (lu) {
        //        console.log(lu.name);
        //        console.log(lu.objGroupType);

        var oldLU = LookUps.findOne({
            'name': lu.name,
            'objGroupType': lu.objGroupType
        });
        if (oldLU == null) {
            lu.hierId = ExartuConfig.SystemHierarchyId;
            console.log('inserting lookup ' + lu.name);
            LookUps.insert(lu);
        } else {
            console.log('updating ' + lu.name);
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