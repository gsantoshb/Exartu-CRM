CandidatesController = RouteController.extend({
  template: 'candidatesList',
  layoutTemplate: 'mainLayout',
  waitOn: function() {
    return [ Meteor.subscribe('jobs'), Meteor.subscribe('contactables')];
  },
  onAfterAction: function() {
    var title = 'Candidates',
    description = 'Manage your candidates here';
    SEO.set({
      title: title,
      meta: {
        'description': description
      },
      og: {
        'title': title,
        'description': description
      }
    });
  }
});

var generateFieldsSearch = function(fields) {
  var searchStringQuery = [];
  _.each(fields, function (field) {
    var aux = {};
    aux[field] = {
        $regex: searchString,
        $options: 'i'
    };
    searchStringQuery.push(aux);
  });
  return searchStringQuery;
};

var searchString, searchDep = new Deps.Dependency;
Template.candidatesList.candidates = function() {
  searchDep.depend();
  searchQuery = {};

  if (!_.isEmpty(searchString)) {
    searchQuery.$or = generateFieldsSearch(['content']);
    var employeeIds = Contactables.find({
      $or: generateFieldsSearch(['person.firstName', 'person.lastName']),
      objNameArray: 'Employee'
    }).fetch();
    if (employeeIds.length > 0)
      searchQuery.$or.push({
        employee: {
          $in: _.map(employeeIds, function(employee) { return employee._id })
        }
      })
    
    var jobIds = Jobs.find({
      $or: generateFieldsSearch(['publicJobTitle'])
    }).fetch();
    if (jobIds.length > 0)
      searchQuery.$or.push({
        job: { 
          $in: _.map(jobIds, function(job) { return job._id })
        }
      });
  };

  return Candidates.find(searchQuery, {
      transform: function(candidate) {
        candidate.job = Jobs.findOne(candidate.job);
        candidate.employee = Contactables.findOne(candidate.employee);

        return candidate;
      }
    }
  );
};

Template.candidatesList.applicationTypeTemplate = function() {
  if(this.type == 'applicant')
    return Template.candidateByApplicant;
  else
    return Template.candidateByRecruiter;
}

Template.candidatesList.events = {
  'keyup #search-string': function(e) {
    searchString = e.currentTarget.value;
    searchDep.changed();
  }
};