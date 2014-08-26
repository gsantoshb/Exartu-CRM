seedSystemLookUps = function (hierId) {
  if (!hierId) hierId=Meteor.user().hierId;
  console.log('lookup hierid',hierId);
    _.forEach(systemLookUps, function (item) {
//        var oldItem = LookUps.findOne({
//            'displayName': item.displayName,
//            'codeType': item.codeType
//        });
//        if (oldItem == undefined) {
            item.hierId = hierId;
            console.log('lookup item',item);
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
