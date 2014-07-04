seedSystemLookUps = function (hierId) {
    _.forEach(systemLookUps, function (item) {
//        var oldItem = LookUps.findOne({
//            'displayName': item.displayName,
//            'codeType': item.codeType
//        });
//        if (oldItem == undefined) {
            item.hierId = hierId;
            LookUps.insert(item);
//        } else {
//            Relations.update({
//                _id: oldItem._id
//            }, {
//                $set: {
//                    displayName: item.displayName
//                }
//            })
//        }
    });
}