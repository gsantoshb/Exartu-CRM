// Seed templates after mergeFields

seedHotLists = function(hierId) {
  var hotLists= [{
      displayName: 'Hotlist Example',
      objNameArray: 	 ["hotList"],
      objType: 'employee'
  }
  ];
    _.forEach(hotLists, function (data) {
        Meteor.call('addHotList', data, function (err, result) {
            if (!err)
                console.log("Hotlist created for demo")
            else
                console.log(err);
        });
    });
};

