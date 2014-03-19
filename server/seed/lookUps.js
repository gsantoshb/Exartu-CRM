seedSystemLookUps = function () {
    _.forEach(systemLookUps, function (item) {
        var oldItem = LookUps.findOne({
            'code': item.code,
            'typeCode': item.typeCode
        });
        if (oldItem == undefined) {
            item.hierId = ExartuConfig.SystemHierarchyId;
            LookUps.insert(item);
        } else {
            Relations.update({
                _id: oldItem._id
            }, {
                $set: {
                    displayName: item.displayName
                }
            })
        }
    });
}