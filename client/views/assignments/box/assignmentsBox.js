var entityType=null;
var isEntitySpecific=false;
Template.matchupsBox.created=function(){
    entityType=Utils.getEntityTypeFromRouter();
    isEntitySpecific=false;
    if (entityType!=null) isEntitySpecific=true
}

Template.matchupsBox.isJob=function() {
  if (entityType==Enums.linkTypes.job.value) return true;
};

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
}

var searchString, searchDep = new Deps.Dependency;
Template.matchupsBox.matchups = function() {
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
  if (isEntitySpecific) {
    if (entityType==Enums.linkTypes.job.value )
      searchQuery.job = Session.get('entityId')  ;
    if (entityType==Enums.linkTypes.contactable.value )
      searchQuery.employee = Session.get('entityId')  ;
  };
  return Matchups.find(searchQuery);
};

Template.matchupsBox.getCount = function(matchups) {
  return Template.matchupsBox.matchups.count();
}

Template.matchupsBox.events = {
  'keyup #search-string': function(e) {
    searchString = e.currentTarget.value;
    searchDep.changed();
  },
  'click .addMatchup': function(e){
      Session.set('addOptions', {job:  Session.get('entityId')});
      Router.go('/matchupAdd/matchup' );
      e.preventDefault();
  }
};