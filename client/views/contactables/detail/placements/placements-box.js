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

    var customer = Contactables.findOne({_id: job.customer}, {transform: null});

    placement.job = job._id;
    placement.jobTitle = job.publicJobTitle;
    if (customer) {
      placement.customerName = customer.organization.organizationName;
      placement.customer = customer._id;
    }
  });

  return placements;
};


