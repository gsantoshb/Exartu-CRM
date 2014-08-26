
Template.contactableMatchupsBox.hasMatchups = function() {
  return _.isObject(this.Employee);
};

Template.contactableMatchupsBox.matchups = function() {
  var matchups = Matchups.find({employee: this._id, inactive: {$ne: true}}).fetch();

  _.forEach(matchups, function(matchup) {
    var job = Jobs.findOne({
      _id: matchup.job
    }, {
      transform: null
    });

    var customer = Contactables.findOne({_id: job.customer}, {transform: null});

    matchup.job = job._id;
    matchup.jobTitle = job.publicJobTitle;
    if (customer) {
      matchup.customerName = customer.organization.organizationName;
      matchup.customer = customer._id;
    }
  });

  return matchups;
};


