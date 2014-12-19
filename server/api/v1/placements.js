Router.map(function() {
  this.route('apiPlacements' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/placements',
    action: function() {
      console.log('API v' + api_version + '/placements ' + this.request.method);

      // Get login token from request
      var loginToken = RESTAPI.getLoginToken(this);
      // Return user associated to loginToken if it is valid.
      var user = RESTAPI.getUserFromToken(loginToken);
      // Create a DPP connection with server and attach user
      var connection = new RESTAPI.connection(user);

      var response = new RESTAPI.response(this.response);

      switch(this.request.method) {
        case 'GET':
          var selector = {
            hierId: user.hierId
          };

          var employeeId = this.params.employeeId;
          if (employeeId)
            selector.employee = employeeId;

          var jobId = this.params.jobId;
          if (jobId)
            selector.job = jobId;

          response.end(Placements.find(selector).map(mapper.get), {type: 'application/json'});

          break;
        // Crete new placement
        // Body:
        //  jobId
        //  employeeId
        //  placementStatusId
        //  candidateStatusId
        //  statusNote (Optional)
        case 'POST':
          var data = this.request.body;

          try {
            var placement = mapper.create(data, user.hierId);
            var placementId = connection.call('apiInsertPlacement', placement);
            _.extend(data, {id: placementId});
            response.end(data);
          } catch(err) {
            console.log(err)
            response.error(err);
          }
          break;

        default:
          response.error('Method not supported');
      }

      connection.close();
    }
  })
});

Meteor.methods({
  apiInsertPlacement: function(placement) {
    return Placements.insert(placement);
  }
});

var mapper = {
  create: function(data, hierId) {
    var placement = {
      objNameArray: [
        'placement'
      ]
    };

    placement.statusNote = data.statusNote;

    var placementStatus = LookUps.find({lookUpCode: Enums.lookUpTypes.placement.status.lookUpCode, _id: data.placementStatusId, hierId: hierId});
    if (! placementStatus)
      throw new Meteor.Error(404, 'Placement status with id ' + data.placementStatusId + ' not found');
    placement.placementStatus = data.placementStatusId;

    var candidateStatus = LookUps.find({lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode, _id: data.candidateStatusId, hierId: hierId});
    if (! candidateStatus)
      throw new Meteor.Error(404, 'Candidate status with id ' + data.candidateStatusId + ' not found');
    placement.candidateStatus = data.candidateStatusId;

    var job = Jobs.find({_id: data.jobId, hierId: hierId});
    if (! job)
      throw new Meteor.Error(404, 'Job with id ' + data.jobId + ' not found');
    placement.job = data.jobId;

    var employee = Contactables.find({_id: data.employeeId, hierId: hierId, objNameArray: 'Employee'});
    if (! employee)
      throw new Meteor.Error(404, 'Employee with id ' + data.employeeId + ' not found');
    placement.employee = data.employeeId;

    //ExternalId
    if (data.externalId){
      placement.externalId = data.externalId;
    }

    return placement;
  },
  get: function(data) {
    if (!data)
      return {};

    return {
      id: data._id,
      dateCreated: data.dateCreated,
      jobId: data.job,
      employeeId: data.employee,
      placementStatusId: data.placementStatus,
      candidateStatusId: data.candidateStatusId,
      statusNote: data.statusNote,
      externalId: data.externalId
    }
  }
};