// Seed templates after mergeFields

seedHotLists = function () {
  var hotLists = [{
    displayName: 'Hotlist Example',
    category: MergeFieldHelper.categories.employee.value
  }];

  _.forEach(hotLists, function (data) {
    try {
      HotListManager.addHotList(data);
      console.log("Hotlist created for demo");
    } catch (err) {
      console.log(err);
    }
  });
};

