CollectionsManager = {
  getContactableListCount: function (userId) {
    if (userId) {
      var currentHier = Utils.getUserHierId(userId);
      return Contactables.find({$or: Utils.filterByHiers(currentHier)}).count();
    } else {
      return 0;
    }
  }
};
