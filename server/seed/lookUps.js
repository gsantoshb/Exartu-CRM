seedSystemLookUps = function () {
    _.forEach(systemLookUps, function (item) {
//        debugger;
        var oldItem = LookUps.findOne({
            'displayName': item.displayName,
            'codeType': item.codeType
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