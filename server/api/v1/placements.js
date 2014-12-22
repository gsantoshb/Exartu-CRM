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
        // Get placements by job and/or employee ID
        // Parameters:
        //  - jobId: string
        //  - employeeId: string
        case 'GET':
          var jobId = this.params.jobId;
          var employeeId = this.params.employeeId;
          try {
            var res = connection.call('getPlacements', jobId, employeeId);

            // Transform the response before sending it back
            res = mapper.get(res);
            response.end(res);
          } catch(err) {
            console.log(err);
            response.error(err.message);
          }
          break;

        // Add a new placement for a job and employee
        // Body:
        //  - jobId: string
        //  - employeeId: string
        //  - placementStatusId: string
        //  - candidateStatusId: string
        //  - statusNote: string ?
        //  - startDate: string (date) ?
        //  - endDate: string (date) ?
        //  - externalId: string ?
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

    // Optional values
    if (data.statusNote) { placement.statusNote = data.statusNote; }
    if (data.startDate) { placement.startDate = new Date(data.startDate); }
    if (data.endDate) { placement.endDate = new Date(data.endDate); }
    if (data.externalId) { placement.externalId = data.externalId; }

    return placement;
  },
  get: function(data) {
    if (!data) return {};

    var result = [];
    _.each(data, function (item) {
      var res = {
        id: item._id,
        jobId: item.job,
        employeeId: item.employee,
        placementStatusId: item.placementStatus,
        candidateStatusId: item.candidateStatus
      };

      // Optional values
      if (item.statusNote) { res.statusNote = item.statusNote; }
      if (item.startDate) { res.startDate = item.startDate; }
      if (item.endDate) { res.endDate = item.endDate; }
      if (item.externalId) { res.externalId = item.externalId; }

      result.push(res);
    });

    return result;
  }
};