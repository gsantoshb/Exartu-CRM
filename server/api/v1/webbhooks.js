Router.map(function() {
  this.route('clickfunnelshook' + api_version, {
    where: 'server',
    path: '/api/' + api_version + '/clickfunnelshook/:userId?',
    action: function() {
      console.log('API v' + api_version + '/clickfunnelshook ' + this.request.method);
      var response = new RESTAPI.response(this.response);
      var userId = this.params.userId;
      if (userId == undefined) {
        response.error("userId not provided");
        return;
      }
      var user = Meteor.users.findOne(userId);
      if(user == undefined) {
        response.error("user not found");
        return;
      }
      var email = this.params.query.email;
      if(email == undefined){
        response.error("no email");
        return;
      }

      var connection = new RESTAPI.connection(user);
      //Hierarchy found, lets see if the funnel has enough info to insert the contact

      var firstName = this.params.query.first_name || this.params.query.name || email ;
      var lastName = this.params.query.last_name || "Unknown";
      var contact = {
        firstName : firstName,
        lastName : lastName
      }
      var contactable = mapper.create(contact, 'Contact');
      var contactableId = connection.call('addContactable', contactable);
      var contactMethodTypes = connection.call('getContactMethodTypes');
      var emailContactMethod = _.find(contactMethodTypes,function(q){
        return _.contains(q.lookUpActions,Enums.lookUpAction.ContactMethod_Email)
      });
      connection.call('addContactMethod', contactableId, emailContactMethod._id,email);
      connection.close();
      response.end("ok");
    }
  })
});


var mapper = {
  create: function (data, type) {
    var contactable = {
      objNameArray: ['contactable', type]
    };
    //
    // api might be sending in faulty data such as a person with a blank or null last name so determine here
    // whether it's a person or an organization based on its contactable type
    // if it's a client, assume organization
    // set any blank fields for its type to 'NA'
    if (type == 'Employee' || type == 'Contact') {
      var personFields = ['firstName', 'lastName', 'middleName', 'jobTitle'];
      _.some(personFields, function (fieldName) {
        if (data[fieldName] == null || data[fieldName] == '') data[fieldName] = '';
      });

      contactable.objNameArray.push('person');

      _.forEach(personFields, function (personField) {
        if (data[personField]) {
          contactable.person = contactable.person || {};
          contactable.person[personField] = data[personField];
        }
      });
    }
    else {

      var organizationFields = ['organizationName', 'department'];
      _.some(organizationFields, function (fieldName) {
        if (data[fieldName] == null || data[fieldName] == '') data[fieldName] = '';
      });
      contactable.objNameArray.push('organization');

      _.forEach(organizationFields, function (organizationField) {
        if (data[organizationField]) {
          contactable.organization = contactable.organization || {};
          contactable.organization[organizationField] = data[organizationField];
        }
      });
    }

    contactable[type] = {statusNote: data.status || ''};


    if (type == 'Contact') {
      if (data.clientId)
        contactable.clientId = data.clientId;
    }

    //department
    if (type == 'Client') {
      if (data.department) {
        contactable.Client = contactable.Client || {};
        contactable.Client.department = data.department;
      }
    }

    //ExternalId
    if (data.externalId) {
      contactable.externalId = data.externalId;
    }

    //SSN
    if (data.ssn) {
      contactable.Employee = contactable.Employee || {};
      contactable.Employee.taxID = data.ssn;
    }

    //tags
    if (data.tags && _.isArray(data.tags)) {
      contactable.tags = data.tags;
    }

    return contactable;
  }
};