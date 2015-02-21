Template.contactablePlacementsBox.created = function () {
  debugger;
  PlacementHandler.setFilter({employee: this._id, inactive: {$ne: true}});
}

Template.contactablePlacementsBox.hasPlacements = function() {
  return _.isObject(this.Employee);
};


Template.contactablePlacementsBox.placements = function() {
  var placements = Placements.find().fetch();

  _.forEach(placements, function(placement) {
    var job = Jobs.findOne({
      _id: placement.job
    }, {
      transform: null
    });

    var client = Contactables.findOne({_id: job.client}, {transform: null});

    placement.job = job._id;
    placement.jobTitle = job.publicJobTitle;
    if (client) {
      placement.clientName = client.organization.organizationName;
      placement.client = client._id;
    }
  });

  return placements;
};


